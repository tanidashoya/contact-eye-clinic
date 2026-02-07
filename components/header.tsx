import SettingSheet from "./setting-sheet";
export default function Header() {
  return (
    <header className="h-20 fixed top-0 left-0 w-full bg-background z-50">
      <div className="flex items-center h-full space-x-4 px-8 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between gap-2">
          <SettingSheet />
        </div>
      </div>
    </header>
  );
}
