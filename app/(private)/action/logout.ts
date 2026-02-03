import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
    return { error: "ログアウトに失敗しました" };
  }
  redirect("/login");
}
