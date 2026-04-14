"use server";
import { loginFormSchema } from "@/lib/validations/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  //safeParseはzodのメソッドで、formDataをスキーマに適用して、エラーがあればエラーを返す
  //.safeParse() を使っているため、result.success で分岐しています。失敗時は result.error（ZodError オブジェクト）にアクセス
  //parse()の場合はtry-catchを使う
  /*
    result.successがtrueの場合は、result.dataにバリデーションが通ったデータが入っている
    {
      success: true,
      data: {
        email: "test@example.com",
        password: "secret12"
      }
    }
  */
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

  //ログイン成功したらホームにリダイレクト
  redirect("/");
}
