import Header from "@/components/header";
import OneSignalIdentify from "@/components/OneSignalIdentify";
import { createClient } from "@/utils/supabase/server";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // userが存在する場合はOneSignalIdentifyを表示
  return (
    <>
      {user && <OneSignalIdentify userId={user.id} />}
      <Header />
      {/* ヘッダーの高さを引いたら中央に表示されるようにする */}
      {/* ヘッダーの高さは96px(h-24=24rem) */}
      <main className="max-w-7xl mx-auto px-4 mt-20 flex flex-col justify-center items-center h-[calc(100vh-80px)] w-full">
        {children}
      </main>
    </>
  );
}
