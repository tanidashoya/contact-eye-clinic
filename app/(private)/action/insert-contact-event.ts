"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { addDaysToDateString, getTodayJstDateString } from "@/lib/date";

export default async function insertContactEvents() {
  const supabase = await createClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError) {
    console.error(getUserError);
    return { error: getUserError.message };
  }
  //コンタクト交換イベント設定を取得
  const { data: contactEventSettings, error: contactEventSettingsError } =
    await supabase
      .from("event_settings")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .eq("event_type", "contact")
      .single();
  if (!contactEventSettings || contactEventSettingsError) {
    console.error(contactEventSettingsError);
    return { error: "コンタクト交換イベント設定の取得に失敗しました" };
  }
  //コンタクト交換イベント設定の周期を取得
  const contactEventCycle = contactEventSettings.cycle_days;

  //コンタクト交換イベントを挿入
  const occurredAt = getTodayJstDateString();
  const nextDueAt = addDaysToDateString(occurredAt, contactEventCycle ?? 14);

  const { error: contactEventError } = await supabase.from("events").insert({
    user_id: user?.id ?? "",
    event_type: "contact",
    occurred_at: occurredAt,
    cycle_days: contactEventCycle ?? 14,
    next_due_at: nextDueAt,
  });
  if (contactEventError) {
    console.error(contactEventError);
    return { error: "コンタクト交換イベントの挿入に失敗しました" };
  }
  /*
  revalidatePath("/") は、Next.js の revalidatePath 関数を使って、指定したパスのキャッシュを無効化して、最新のデータを表示するための関数です。
  この関数を使うことで、ユーザーがページをリロードしたときに、最新のデータが表示されるようになります。
  */
  revalidatePath("/");
  return { error: null };
}
