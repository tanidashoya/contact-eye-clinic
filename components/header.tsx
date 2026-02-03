import Image from "next/image";
import Link from "next/link";
import SettingSheet from "./setting-sheet";

export default function Header() {
  return (
    <header className="h-24 fixed top-0 left-0 w-full bg-background z-50">
      <div className="flex items-center h-full justify-between space-x-4 px-8 max-w-[1920px] mx-auto">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo2.png" alt="logo" width={70} height={70} />
            <span className="text-2xl font-bold">Contact Eye Clinic</span>
          </Link>
        </div>
        <div>
          <SettingSheet />
        </div>
      </div>
    </header>
  );
}
