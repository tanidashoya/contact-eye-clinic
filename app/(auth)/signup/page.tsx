"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signup } from "./action";
import { toast } from "sonner";

export default function SignupPage() {
  const handleSubmit = async (formData: FormData) => {
    const result = await signup(formData); //resultは{ error: string | undefined } | undefined 型のオブジェクト(エラーの時のみ返す)
    if (result?.error) {
      console.error(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <form className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">アカウント新規登録</h1>
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            お名前
          </label>
          <Input id="name" type="text" placeholder="お名前" name="name" />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            placeholder="メールアドレス"
            name="email"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            パスワード
          </label>
          <Input
            id="password"
            type="password"
            placeholder="パスワード"
            name="password"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="bg-primary hover:bg-primary/80 text-white"
          formAction={handleSubmit}
        >
          新規登録
        </Button>
      </form>
      <Link href="/login" className="text-blue-500 hover:text-blue-600">
        ログインはこちら
      </Link>
    </div>
  );
}
