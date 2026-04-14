"use client";

import insertContactEvent from "@/app/(private)/action/insert-contact-event";
import insertEyecareEvent from "@/app/(private)/action/insert-eyecare-event";
import { DateDisplayProps } from "@/types";
import { Button } from "./ui/button";
import { CalendarCheck2, Eye, History, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
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
  },
} as const;

function getTodayJST(): string {
  return getTodayJstDateString();
}

function formatDate(value?: string, emptyText = "未登録") {
  if (!value) return emptyText;

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${year}.${month}.${day}`;
}

export default function DateDisplay({
  eventType,
  occurredAt,
  next,
}: DateDisplayProps) {
  //クライアントからルーティング（ページ遷移や更新）を操作するためのフック
  const router = useRouter();
  const normalizedEventType = eventType === "clinic" ? "clinic" : "contact";
  const config = EVENT_CONFIG[normalizedEventType];
  const [isPending, startTransition] = useTransition();

  const handleRecord = async () => {
    startTransition(async () => {
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
      //router.refresh()は今の URL のサーバーコンポーネントを取り直して、今のツリーに反映して」 とクライアントから明示的に頼む API
      router.refresh();
    });
  };

  const Icon = config.icon;

  return (
    <div className="flex h-full flex-col gap-5">
      <div
        className={`rounded-[1.75rem] border p-5 md:p-6 ${config.accentClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.16em] uppercase ${config.badgeClass}`}
            >
              {config.badge}
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-500">次回予定日</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-800 md:text-4xl">
                {formatDate(next, config.emptyText)}
              </p>
              {next && next < getTodayJST() && (
                <span className="inline-block text-xs text-red-600 bg-red-50 rounded-full px-2 py-0.5">
                  予定日を過ぎています
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-stone-600 shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-500">
            <History className="size-4" />
            <span>前回記録日</span>
          </div>
          <p className="text-md text-gray-500 font-semibold">
            {formatDate(occurredAt, config.emptyText)}
          </p>
        </div>
      </div>

      <Button
        onClick={handleRecord}
        disabled={isPending}
        variant="outline"
        size="lg"
        className={`w-full rounded-2xl my-2 border px-5 py-6 text-sm font-medium transition-colors ${config.buttonClass}`}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <CalendarCheck2 className="size-4" />
            {config.buttonLabel}
          </>
        )}
      </Button>
    </div>
  );
}
