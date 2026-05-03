"use server";
import { signupFormSchema } from "@/lib/validations/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const result = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message ??
        "入力内容を確認してください",
    };
  }

  const { name, email, password } = result.data;

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
    return { error: "新規登録に失敗しました。入力内容を確認してください。" };
  }

  redirect("/");
}
