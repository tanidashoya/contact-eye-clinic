"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
  const { error: contactEventError } = await supabase.from("events").insert({
    user_id: user?.id ?? "",
    event_type: "contact",
    occurred_at: new Date().toISOString().slice(0, 10),
    cycle_days: contactEventCycle ?? 14,
    next_due_at: new Date(
      new Date().setDate(new Date().getDate() + contactEventCycle),
    )
      .toISOString()
      .slice(0, 10),
  });
  if (contactEventError) {
    console.error(contactEventError);
    return { error: "コンタクト交換イベントの挿入に失敗しました" };
  }
  revalidatePath("/");
}
