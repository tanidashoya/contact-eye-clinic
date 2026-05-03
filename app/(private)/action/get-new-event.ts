"use server";

import { createAuthenticatedClient } from "./require-auth-user";

export default async function getNewEvents() {
  const { error: authError, supabase, user } = await createAuthenticatedClient();
  if (authError) return { error: authError };

  const { data: contactEvent, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "contact")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "コンタクト交換記録の取得に失敗しました" };
  }

  const { data: clinicEvent, error: clinicError } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "clinic")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (clinicError) {
    console.error(clinicError);
    return { error: "眼科受診記録の取得に失敗しました" };
  }

  return { contactEvent, clinicEvent, error: null };
}
