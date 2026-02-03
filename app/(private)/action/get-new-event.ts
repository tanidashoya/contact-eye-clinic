"use server";

import { createClient } from "@/utils/supabase/server";

//最新のコンタクト交換イベントと眼科受診イベントを取得
export default async function getNewEvents(userId: string) {
  const supabase = await createClient();

  const { data: contactEvent, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .eq("event_type", "contact")
    .order("created_at", { ascending: false }) //最新のイベントを取得(ascending: falseで降順)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error(error);
    return { error: "コンタクト交換イベントの取得に失敗しました" };
  }
  const { data: clinicEvent, error: clinicError } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .eq("event_type", "clinic")
    .order("created_at", { ascending: false }) //最新のイベントを取得(ascending: falseで降順)
    .limit(1)
    .maybeSingle();
  if (clinicError) {
    console.error(clinicError);
    return { error: "眼科受診イベントの取得に失敗しました" };
  }
  return { contactEvent, clinicEvent };
}
