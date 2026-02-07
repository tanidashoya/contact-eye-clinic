import { createClient } from "@/utils/supabase/server";
import SettingSheetClient from "./setting-sheet-client";
import { redirect } from "next/navigation";

export default async function SettingSheet() {
  const supabase = await createClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error(getUserError);
    redirect("/login?error=user_not_found");
  }

  //middreware.tsで認証チェックしているので、ここではチェックしない
  // if (!user) {
  //   redirect("/login");
  // }

  //ユーザー通知設定を取得
  const { data: userSettings, error: userSettingsError } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (userSettingsError) {
    console.error(userSettingsError);
    redirect("/login?error=user_settings_not_found");
  }

  //コンタクト交換イベント設定を取得
  const { data: contactSettings, error: contactSettingsError } = await supabase
    .from("event_settings")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "contact")
    .single();
  if (contactSettingsError) {
    console.error(contactSettingsError);
    redirect("/login?error=contact_settings_not_found");
  }

  //眼科受診イベント設定を取得
  const { data: clinicSettings, error: clinicSettingsError } = await supabase
    .from("event_settings")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "clinic")
    .single();
  if (clinicSettingsError) {
    console.error(clinicSettingsError);
    redirect("/login?error=clinic_settings_not_found");
  }

  return (
    <SettingSheetClient
      user={user}
      userSettings={userSettings}
      contactSettings={contactSettings}
      clinicSettings={clinicSettings}
    />
  );
}
