import Header from "@/components/header";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-10 mt-24">{children}</main>
    </>
  );
}
