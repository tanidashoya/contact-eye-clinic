"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error(signOutError);
    return { error: "ログアウトに失敗しました" };
  }
  redirect("/login");
}
