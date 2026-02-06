"use server";
import { createClient } from "@/utils/supabase/server";
import { UpdateClinicSettingsProps } from "@/types";

export default async function updateClinicSettings({
  userId,
  clinicCycle,
}: UpdateClinicSettingsProps) {
  const supabase = await createClient();
  //コンタクト交換イベント設定を更新
  const { error: updateClinicSettingsError } = await supabase
    .from("event_settings")
    .update({
      cycle_days: clinicCycle,
    })
    .eq("user_id", userId)
    .eq("event_type", "clinic");
  if (updateClinicSettingsError) {
    console.error(updateClinicSettingsError);
    return { error: "眼科受診イベント設定の更新に失敗しました" };
  }
}
