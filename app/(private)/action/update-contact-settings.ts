"use server";

import { updateContactSettingsSchema } from "@/lib/validations/settings";
import { createAuthenticatedClient } from "./require-auth-user";

export default async function updateContactSettings(input: unknown) {
  const parsed = updateContactSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { error: authError, supabase, user } = await createAuthenticatedClient();
  if (authError) return { error: authError };

  const { contactCycle } = parsed.data;

  const { error } = await supabase
    .from("event_settings")
    .update({ cycle_days: contactCycle })
    .eq("user_id", user.id)
    .eq("event_type", "contact");

  if (error) {
    console.error(error);
    return { error: "コンタクト交換周期の更新に失敗しました" };
  }

  return { error: null };
}
