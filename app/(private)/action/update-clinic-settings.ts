"use server";

import { updateClinicSettingsSchema } from "@/lib/validations/settings";
import { createAuthenticatedClient } from "./require-auth-user";

export default async function updateClinicSettings(input: unknown) {
  const parsed = updateClinicSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { error: authError, supabase, user } = await createAuthenticatedClient();
  if (authError) return { error: authError };

  const { clinicCycle } = parsed.data;

  const { error } = await supabase
    .from("event_settings")
    .update({ cycle_days: clinicCycle })
    .eq("user_id", user.id)
    .eq("event_type", "clinic");

  if (error) {
    console.error(error);
    return { error: "眼科受診周期の更新に失敗しました" };
  }

  return { error: null };
}
