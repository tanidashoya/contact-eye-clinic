"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function insertEyecareEvent() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  //眼科受診イベント設定を取得
  const { data: eyeCareEventSettings, error: eyeCareEventSettingsError } =
    await supabase
      .from("event_settings")
      .select("*")
      .eq("user_id", user.user?.id ?? "")
      .eq("event_type", "clinic")
      .single();
  if (!eyeCareEventSettings || eyeCareEventSettingsError) {
    console.error(eyeCareEventSettingsError);
    return { error: "眼科受診イベント設定の取得に失敗しました" };
  }

  //眼科受診イベント設定の周期を取得
  const eyeCareEventCycle = eyeCareEventSettings.cycle_days;

  //眼科受診イベントを挿入
  const { error: eyeCareEventError } = await supabase.from("events").insert({
    user_id: user.user?.id,
    event_type: "clinic",
    occurred_at: new Date().toISOString().slice(0, 10),
    cycle_days: eyeCareEventCycle ?? 180,
    next_due_at: new Date(
      new Date().setDate(new Date().getDate() + eyeCareEventCycle),
    )
      .toISOString()
      .slice(0, 10),
  });
  if (eyeCareEventError) {
    console.error(eyeCareEventError);
    return { error: "眼科受診イベントの挿入に失敗しました" };
  }
  revalidatePath("/");
}
