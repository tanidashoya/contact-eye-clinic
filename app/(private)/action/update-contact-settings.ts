"use server";
import { createClient } from "@/utils/supabase/server";
import { UpdateContactSettingsProps } from "@/types";

export default async function updateContactSettings({
  user,
  contactCycle,
}: UpdateContactSettingsProps) {
  const supabase = await createClient();
  //コンタクト交換イベント設定を更新
  const { error: updateContactSettingsError } = await supabase
    .from("event_settings")
    .update({
      cycle_days: contactCycle,
    })
    .eq("user_id", user.id)
    .eq("event_type", "contact");
  if (updateContactSettingsError) {
    console.error(updateContactSettingsError);
    return { error: "コンタクト交換イベント設定の更新に失敗しました" };
  }
}
