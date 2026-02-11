"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { login } from "./action";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import OneSignal from "react-onesignal";

function LoginForm() {
  const searchParams = useSearchParams();
  const handleSubmit = async (formData: FormData) => {
    const result = await login(formData);
    if (result?.error) {
      toast.error(result.error);
    }
  };

  // ログインページに遷移した時点でOneSignalのログアウトを実行
  // Cookieが切れてリダイレクトされた場合にOneSignalのログイン状態が残るのを防ぐ
  useEffect(() => {
    OneSignal.logout().catch(() => {
      // 未初期化の場合はエラーになるが無視してOK
    });
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    switch (error) {
      case "user_not_found":
        toast.error("ユーザーが見つかりません。再度ログインしてください。");
        break;
      case "user_settings_not_found":
        toast.error(
          "ユーザー通知設定が見つかりません。再度ログインしてください。"
        );
        break;
      case "contact_settings_not_found":
        toast.error(
          "コンタクト交換イベント設定が見つかりません。再度ログインしてください。"
        );
        break;
      case "clinic_settings_not_found":
        toast.error(
          "眼科受診イベント設定が見つかりません。再度ログインしてください。"
        );
        break;
      case "get_new_event_error":
        toast.error("イベントの取得に失敗しました。再度ログインしてください。");
        break;
    }
  }, [searchParams]);

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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
