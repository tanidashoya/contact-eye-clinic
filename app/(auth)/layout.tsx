export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-dvh overflow-hidden">{children}</div>;
}
