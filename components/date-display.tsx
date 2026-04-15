"use client";

import insertContactEvent from "@/app/(private)/action/insert-contact-event";
import insertEyecareEvent from "@/app/(private)/action/insert-eyecare-event";
import updateEventDate from "@/app/(private)/action/update-event-date";
import { DateDisplayProps } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  CalendarCheck2,
  Check,
  Eye,
  History,
  Loader2,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { KeyboardEvent } from "react";
import { useState, useTransition } from "react";
import { getTodayJstDateString } from "@/lib/date";
import { useRouter } from "next/navigation";

const EVENT_CONFIG = {
  contact: {
    icon: Sparkles,
    badge: "Contact Lens",
    buttonLabel: "交換を記録する",
    helperText: "交換した日に、やさしく更新できます。",
    emptyText: "まだ交換記録がありません",
    accentClass:
      "border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-teal-50",
    badgeClass: "bg-emerald-100 text-emerald-700",
    buttonClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-200",
    loadingClass: "text-emerald-600",
  },
  clinic: {
    icon: Eye,
    badge: "Eye Clinic",
    buttonLabel: "受診を記録する",
    helperText: "受診した日に、すぐ記録へ反映できます。",
    emptyText: "まだ受診記録がありません",
    accentClass:
      "border-sky-100 bg-linear-to-br from-sky-50 via-white to-cyan-50",
    badgeClass: "bg-sky-100 text-sky-700",
    buttonClass:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 focus-visible:ring-sky-200",
    loadingClass: "text-sky-600",
  },
} as const;

type EventType = keyof typeof EVENT_CONFIG;
type EventDateField = "occurred_at" | "next_due_at";
const UNSET_DATE_TEXT = "まだ設定されていません";

function getTodayJST(): string {
  return getTodayJstDateString();
}

function formatDate(value?: string | null, emptyText = "未登録") {
  if (!value) return emptyText;

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${year}.${month}.${day}`;
}

function DateLoadingSpinner({
  className,
  large = false,
}: {
  className: string;
  large?: boolean;
}) {
  return (
    <span
      aria-label="更新中"
      className={`inline-flex items-center ${className}`}
      role="status"
    >
      <Loader2
        aria-hidden="true"
        className={`${large ? "size-7 md:size-8" : "size-5"} shrink-0 animate-spin`}
      />
    </span>
  );
}

export default function DateDisplay({
  eventId,
  eventType,
  occurredAt,
  next,
}: DateDisplayProps) {
  //クライアントからルーティング（ページ遷移や更新）を操作するためのフック
  const router = useRouter();
  const normalizedEventType: EventType =
    eventType === "clinic" ? "clinic" : "contact";
  const config = EVENT_CONFIG[normalizedEventType];
  const [recordPending, startRecordTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [optimisticOccurredAt, setOptimisticOccurredAt] = useState<
    string | null | undefined
  >();
  const [optimisticNext, setOptimisticNext] = useState<
    string | null | undefined
  >();
  const [editingField, setEditingField] = useState<EventDateField | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [pendingField, setPendingField] = useState<EventDateField | null>(null);

  const displayOccurredAt =
    optimisticOccurredAt !== undefined ? optimisticOccurredAt : occurredAt;
  const displayNext = optimisticNext !== undefined ? optimisticNext : next;
  const showOccurredLoading =
    recordPending || pendingField === "occurred_at";
  const showNextLoading =
    recordPending ||
    pendingField === "occurred_at" ||
    pendingField === "next_due_at";
  const isAnyPending = recordPending || editPending || pendingField !== null;

  const startEditing = (field: EventDateField, value?: string | null) => {
    if (!eventId || isAnyPending) return;

    setEditingField(field);
    setDraftDate(value ?? "");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftDate("");
  };

  const handleSaveDate = () => {
    if (!eventId || !editingField || isAnyPending) return;

    const field = editingField;
    const value = draftDate;
    const currentValue =
      field === "occurred_at" ? displayOccurredAt : displayNext;

    if (value === (currentValue ?? "")) {
      cancelEditing();
      return;
    }

    setPendingField(field);
    startEditTransition(async () => {
      const result = await updateEventDate({
        eventId,
        eventType: normalizedEventType,
        field,
        value,
      });

      if (result?.error) {
        console.error(result.error);
        toast.error(result.error);
        setPendingField(null);
        return;
      }

      if (result?.occurredAt !== undefined) {
        setOptimisticOccurredAt(result.occurredAt);
      }
      if (result?.next !== undefined) {
        setOptimisticNext(result.next);
      }

      setEditingField(null);
      setDraftDate("");
      setPendingField(null);
      router.refresh();
    });
  };

  const handleDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveDate();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleRecord = async () => {
    startRecordTransition(async () => {
      const action =
        normalizedEventType === "contact"
          ? insertContactEvent
          : insertEyecareEvent;
      const result = await action();

      if (result?.error) {
        console.error(result.error);
        toast.error(result.error);
        return;
      }
      setOptimisticOccurredAt(undefined);
      setOptimisticNext(undefined);
      //router.refresh()は今の URL のサーバーコンポーネントを取り直して、今のツリーに反映して」 とクライアントから明示的に頼む API
      router.refresh();
    });
  };

  const Icon = config.icon;
  const isEditingNext = editingField === "next_due_at";
  const isEditingOccurredAt = editingField === "occurred_at";
  const canEdit = Boolean(eventId);

  return (
    <div className="flex h-full flex-col gap-5">
      <div
        aria-busy={showNextLoading}
        className={`rounded-[1.75rem] border p-5 md:p-6 ${config.accentClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.16em] uppercase ${config.badgeClass}`}
            >
              {config.badge}
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-500">次回予定日</p>
              <div className="flex min-h-9 w-full min-w-0 items-center gap-2 md:min-h-10">
                {showNextLoading ? (
                  <DateLoadingSpinner className={config.loadingClass} large />
                ) : isEditingNext ? (
                  <>
                    <Input
                      autoFocus
                      className="h-10 min-w-0 flex-1 bg-white text-base"
                      onChange={(event) => setDraftDate(event.target.value)}
                      onKeyDown={handleDateKeyDown}
                      type="date"
                      value={draftDate}
                    />
                    <Button
                      aria-label="次回予定日を保存"
                      className="shrink-0 bg-white/80"
                      onClick={handleSaveDate}
                      size="icon-xs"
                      type="button"
                      variant="outline"
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      aria-label="次回予定日の編集をキャンセル"
                      className="shrink-0 bg-white/80"
                      onClick={cancelEditing}
                      size="icon-xs"
                      type="button"
                      variant="outline"
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      className={`text-left font-semibold tracking-tight text-stone-800 transition-colors hover:text-stone-600 disabled:pointer-events-none ${
                        displayNext ? "text-xl md:text-4xl" : "text-base md:text-lg"
                      }`}
                      disabled={!canEdit || isAnyPending}
                      onClick={() => startEditing("next_due_at", displayNext)}
                      type="button"
                    >
                      {formatDate(displayNext, UNSET_DATE_TEXT)}
                    </button>
                    {canEdit && (
                      <Button
                        aria-label="次回予定日を編集"
                        className="size-8 bg-white/70 text-stone-500 hover:text-stone-700"
                        disabled={isAnyPending}
                        onClick={() => startEditing("next_due_at", displayNext)}
                        size="icon-sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              {!showNextLoading && displayNext && displayNext < getTodayJST() && (
                <span className="inline-block text-xs text-red-600 bg-red-50 rounded-full px-2 py-0.5">
                  予定日を過ぎています
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/80 p-3 text-stone-600 shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div
          aria-busy={showOccurredLoading}
          className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-500">
            <History className="size-4" />
            <span>前回記録日</span>
          </div>
          <div className="flex min-h-8 w-full min-w-0 items-center gap-2">
            {showOccurredLoading ? (
              <DateLoadingSpinner className={config.loadingClass} />
            ) : isEditingOccurredAt ? (
              <>
                <Input
                  autoFocus
                  className="h-8 min-w-0 flex-1 bg-white text-sm"
                  onChange={(event) => setDraftDate(event.target.value)}
                  onKeyDown={handleDateKeyDown}
                  type="date"
                  value={draftDate}
                />
                <Button
                  aria-label="前回記録日を保存"
                  className="shrink-0 bg-white/80"
                  onClick={handleSaveDate}
                  size="icon-xs"
                  type="button"
                  variant="outline"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  aria-label="前回記録日の編集をキャンセル"
                  className="shrink-0 bg-white/80"
                  onClick={cancelEditing}
                  size="icon-xs"
                  type="button"
                  variant="outline"
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <button
                  className="text-md text-left font-semibold text-gray-500 transition-colors hover:text-gray-700 disabled:pointer-events-none"
                  disabled={!canEdit || isAnyPending}
                  onClick={() => startEditing("occurred_at", displayOccurredAt)}
                  type="button"
                >
                  {formatDate(displayOccurredAt, UNSET_DATE_TEXT)}
                </button>
                {canEdit && (
                  <Button
                    aria-label="前回記録日を編集"
                    className="size-8 bg-white/70 text-stone-500 hover:text-stone-700"
                    disabled={isAnyPending}
                    onClick={() => startEditing("occurred_at", displayOccurredAt)}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleRecord}
        disabled={isAnyPending}
        variant="outline"
        size="lg"
        className={`w-full rounded-2xl my-2 border px-5 py-6 text-sm font-medium transition-colors ${config.buttonClass}`}
      >
        <CalendarCheck2 className="size-4" />
        {config.buttonLabel}
      </Button>
    </div>
  );
}
