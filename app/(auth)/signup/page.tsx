"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signup } from "./action";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-1">
        <Image src="/logo2.png" alt="Eye Check" width={56} height={56} />
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Eye Check
        </span>
        <p className="text-sm text-muted-foreground">アカウント新規登録</p>
      </div>

      <form className="flex w-full max-w-xs flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            お名前
          </label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="お名前"
            required
            maxLength={50}
            autoComplete="name"
          />
        </div>
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
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "新規登録"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 text-sm text-blue-500 underline-offset-4 hover:text-foreground hover:underline"
      >
        アカウントをお持ちの方はこちら
      </Link>
    </div>
  );
}
