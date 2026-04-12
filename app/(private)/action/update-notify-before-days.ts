"use server";
import { createClient } from "@/utils/supabase/server";
import { UpdateNotifyBeforeDaysProps } from "@/types";

export default async function updateNotifyBeforeDays({
  user,
  contactNotifyBeforeDays,
  clinicNotifyBeforeDays,
}: UpdateNotifyBeforeDaysProps) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_settings")
    .update({
      contact_notify_before_days: contactNotifyBeforeDays,
      clinic_notify_before_days: clinicNotifyBeforeDays,
    })
    .eq("user_id", user.id);
  if (error) {
    console.error(error);
    return { error: "通知前日数の更新に失敗しました" };
  }
}
