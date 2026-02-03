import { createClient } from "@/utils/supabase/server";
import SettingSheetClient from "./setting-sheet-client";

export default async function SettingSheet() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return <SettingSheetClient />;
}
