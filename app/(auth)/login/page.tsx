"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OneSignal from "react-onesignal";
import { toast } from "sonner";
import { login } from "./action";

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    OneSignal.logout().catch(() => {
      // ログアウト状態で失敗しても、画面表示の継続を優先する。
    });
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    switch (error) {
      case "user_not_found":
        toast.error("ユーザーが見つかりません。再度ログインしてください。");
        break;
      case "user_settings_not_found":
        toast.error("ユーザー設定が見つかりません。再度ログインしてください。");
        break;
      case "contact_settings_not_found":
        toast.error(
          "コンタクト交換イベント設定が見つかりません。再度ログインしてください。",
        );
        break;
      case "clinic_settings_not_found":
        toast.error(
          "眼科受診イベント設定が見つかりません。再度ログインしてください。",
        );
        break;
      case "get_new_event_error":
        toast.error("イベント取得に失敗しました。再度ログインしてください。");
        break;
    }
  }, [searchParams]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-1">
        <Image src="/logo2.png" alt="Eye Check" width={56} height={56} />
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Eye Check
        </span>
        <p className="text-sm text-muted-foreground">
          コンタクトと眼科のかんたん管理
        </p>
      </div>

      <form className="flex w-full max-w-xs flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
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
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ログイン"}
        </Button>
      </form>

      <Link
        href="/signup"
        className="mt-6 text-sm text-blue-500 underline-offset-4 hover:text-foreground hover:underline"
      >
        アカウントをお持ちでない方はこちら
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
