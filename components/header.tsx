import Image from "next/image";
import SettingSheet from "./setting-sheet";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between pl-4 pr-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo2.png" alt="Eye Check" width={60} height={60} />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Eye Check
          </span>
        </div>
        <SettingSheet />
      </div>
    </header>
  );
}
