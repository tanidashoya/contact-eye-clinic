"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { login } from "./action";
import { toast } from "sonner";

export default function LoginPage() {
  const handleSubmit = async (formData: FormData) => {
    const result = await login(formData); //resultは{ error: string | undefined } | undefined 型のオブジェクト(エラーの時のみ返す)
    if (result?.error) {
      toast.error(result.error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <form className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="メールアドレス"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            パスワード
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="パスワード"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="bg-primary hover:bg-primary/80 text-white"
          formAction={handleSubmit}
        >
          ログイン
        </Button>
      </form>
      <Link href="/signup" className="text-blue-500 hover:text-blue-600">
        新規登録はこちら
      </Link>
    </div>
  );
}
