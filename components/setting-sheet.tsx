import { createClient } from "@/utils/supabase/server";
import SettingSheetClient from "./setting-sheet-client";

export default async function SettingSheet() {
  const supabase = await createClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError) {
    console.error(getUserError);
    throw new Error("ユーザーの取得に失敗しました");
  }

  //middreware.tsで認証チェックしているので、ここではチェックしない
  // if (!user) {
  //   redirect("/login");
  // }

  //ユーザー通知設定を取得
  const { data: userSettings, error: userSettingsError } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();
  if (userSettingsError) {
    console.error(userSettingsError);
    throw new Error("ユーザー通知設定の取得に失敗しました");
  }

  //コンタクト交換イベント設定を取得
  const { data: contactSettings, error: contactSettingsError } = await supabase
    .from("event_settings")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("event_type", "contact")
    .single();
  if (contactSettingsError) {
    console.error(contactSettingsError);
    throw new Error("コンタクト交換イベント設定の取得に失敗しました");
  }

  //眼科受診イベント設定を取得
  const { data: clinicSettings, error: clinicSettingsError } = await supabase
    .from("event_settings")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("event_type", "clinic")
    .single();
  if (clinicSettingsError) {
    console.error(clinicSettingsError);
    throw new Error("眼科受診イベント設定の取得に失敗しました");
  }

  return (
    <SettingSheetClient
      userId={user?.id}
      userSettings={userSettings}
      contactSettings={contactSettings}
      clinicSettings={clinicSettings}
    />
  );
}
