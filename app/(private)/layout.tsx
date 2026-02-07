import Header from "@/components/header";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {/* ヘッダーの高さを引いたら中央に表示されるようにする */}
      {/* ヘッダーの高さは96px(h-24=24rem) */}
      <main className="max-w-7xl mx-auto px-4 mt-20 flex flex-col justify-center items-center h-[calc(100vh-80px)] w-full">
        {children}
      </main>
    </>
  );
}
