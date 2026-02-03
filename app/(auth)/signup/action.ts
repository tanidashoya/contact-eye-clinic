"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string; //バリデーションを作成したときにas stringを外す
  const email = formData.get("email") as string; //バリデーションを作成したときにas stringを外す
  const password = formData.get("password") as string; //バリデーションを作成したときにas stringを外す
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (signUpError) {
    console.error("SignUp Error:", signUpError.message, signUpError.code);
    return { error: `新規登録に失敗しました: ${signUpError.message}` };
  }

  redirect("/");
}
