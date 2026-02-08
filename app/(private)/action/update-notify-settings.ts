"use server";
import { createClient } from "@/utils/supabase/server";
import { UpdateNotifySettingsProps } from "@/types";

export default async function updateNotifySettings({
  user,
  notifyEnabled,
}: UpdateNotifySettingsProps) {
  const supabase = await createClient();
  //通知設定を更新
  const { error: updateNotifySettingsError } = await supabase
    .from("user_settings")
    .update({
      notify_enabled: notifyEnabled,
    })
    .eq("user_id", user.id);
  if (updateNotifySettingsError) {
    console.error(updateNotifySettingsError);
    return { error: "通知設定の更新に失敗しました" };
  }
}
