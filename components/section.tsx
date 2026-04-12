"use client";
interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function Section({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section className="flex h-full w-full flex-col rounded-[2rem] border border-stone-200/80 bg-white/95 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur md:p-8">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">
          Daily Care
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-800 md:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-sm text-sm leading-6 text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
