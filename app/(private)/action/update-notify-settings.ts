"use server";

import { updateNotifySettingsSchema } from "@/lib/validations/settings";
import { createAuthenticatedClient } from "./require-auth-user";

export default async function updateNotifySettings(input: unknown) {
  const parsed = updateNotifySettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { error: authError, supabase, user } = await createAuthenticatedClient();
  if (authError) return { error: authError };

  const { notifyEnabled } = parsed.data;

  const { error } = await supabase
    .from("user_settings")
    .update({ notify_enabled: notifyEnabled })
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return { error: "通知設定の更新に失敗しました" };
  }

  return { error: null };
}
