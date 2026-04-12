"use server";
import { loginFormSchema } from "@/lib/validations/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const result = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { email, password } = result.data;

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
