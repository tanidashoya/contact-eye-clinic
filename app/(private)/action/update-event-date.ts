"use server";

import { revalidatePath } from "next/cache";
import { addDaysToDateString } from "@/lib/date";
import {
  UpdateEventDateInput,
  updateEventDateSchema,
} from "@/lib/validations/event-date";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_CYCLE_DAYS = {
  contact: 14,
  clinic: 180,
} as const;

export default async function updateEventDate(input: unknown) {
  const parsed = updateEventDateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "日付の入力内容を確認してください",
    };
  }

  const { eventId, eventType, field, value } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error(getUserError);
    return { error: "ユーザー情報の取得に失敗しました" };
  }

  const { data: currentEvent, error: currentEventError } = await supabase
    .from("events")
    .select("cycle_days")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .eq("event_type", eventType)
    .single();

  if (currentEventError || !currentEvent) {
    console.error(currentEventError);
    return { error: "更新対象の記録が見つかりません" };
  }

  const updateValues: Partial<
    Record<UpdateEventDateInput["field"], string | null>
  > = {
    [field]: value,
  };
  const nextDueAt =
    field === "occurred_at" && value
      ? addDaysToDateString(
          value,
          currentEvent.cycle_days ?? DEFAULT_CYCLE_DAYS[eventType],
        )
      : field === "occurred_at"
        ? null
        : value;

  if (field === "occurred_at") {
    updateValues.next_due_at = nextDueAt;
  }

  const { error: updateEventError } = await supabase
    .from("events")
    .update(updateValues)
    .eq("id", eventId)
    .eq("user_id", user.id)
    .eq("event_type", eventType);

  if (updateEventError) {
    console.error(updateEventError);
    return { error: "日付の更新に失敗しました" };
  }

  revalidatePath("/");

  return {
    error: null,
    occurredAt: field === "occurred_at" ? value : undefined,
    next: nextDueAt,
  };
}
