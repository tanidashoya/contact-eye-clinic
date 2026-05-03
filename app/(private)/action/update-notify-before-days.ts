"use server";

import { updateNotifyBeforeDaysSchema } from "@/lib/validations/settings";
import { createAuthenticatedClient } from "./require-auth-user";

export default async function updateNotifyBeforeDays(input: unknown) {
  const parsed = updateNotifyBeforeDaysSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { error: authError, supabase, user } = await createAuthenticatedClient();
  if (authError) return { error: authError };

  const { contactNotifyBeforeDays, clinicNotifyBeforeDays } = parsed.data;

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

  return { error: null };
}
