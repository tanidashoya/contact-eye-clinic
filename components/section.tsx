"use client";
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}
