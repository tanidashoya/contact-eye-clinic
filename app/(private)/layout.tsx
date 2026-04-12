import Header from "@/components/header";
import IosInstallPrompt from "@/components/ios-install-prompt";
import OneSignalIdentify from "@/components/OneSignalIdentify";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //ユーザーが存在しない場合はログイン画面にリダイレクト
  if (!user) {
    redirect("/login?error=user_not_found");
  }
  return (
    <>
      <IosInstallPrompt />
      <OneSignalIdentify userId={user.id} user={user} />
      <Header />
      {/* ヘッダーの高さを引いたら中央に表示されるようにする */}
      {/* ヘッダーの高さは80px(h-20=20rem) */}
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl flex-col items-center justify-center px-4 py-10">
        {children}
      </main>
    </>
  );
}
