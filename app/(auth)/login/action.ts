"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string; //バリデーションを作成したときにas stringを外す
  const password = formData.get("password") as string; //バリデーションを作成したときにas stringを外す

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error(signInError);
    return {
      error: "ログインに失敗しました",
    };
  }

  redirect("/");
}
