"use client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { CalendarCog } from "lucide-react";
import { useState } from "react";
import { SettingSheetClientProps } from "@/types";
import Image from "next/image";
import UserSettings from "./user-settings";
import ContactClinicSettings from "./contact-clinic-settings";
import { logout } from "@/app/(private)/action/logout";
import { toast } from "sonner";
import LogoutDialog from "./logout-dialog";
import OneSignal from "react-onesignal";

export default function SettingSheetClient({
  user,
  userSettings,
  contactSettings,
  clinicSettings,
}: SettingSheetClientProps) {
  const [isnotification, setIsnotification] = useState(
    userSettings.notify_enabled
  );
  const [clinicNotifyBeforeDays, setClinicNotifyBeforeDays] = useState(
    userSettings.clinic_notify_before_days
  );
  const [contactNotifyBeforeDays, setContactNotifyBeforeDays] = useState(
    userSettings.contact_notify_before_days
  );
  const [contactCycle, setContactCycle] = useState(contactSettings.cycle_days);
  const [clinicCycle, setClinicCycle] = useState(clinicSettings.cycle_days);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const { error: logoutError } = await logout();
    if (logoutError) {
      console.error(logoutError);
      toast.error("ログアウトに失敗しました");
      return;
    }
    await OneSignal.logout();
    setIsLoading(false);
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" asChild>
          <CalendarCog size={30} color="gray" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[80%]" side="left">
        <SheetTitle className="h-22 text-xl font-bold flex items-center gap-2 pl-2 border-b border-gray-200 bg-gray-20">
          <Image src="/logo2.png" alt="logo" width={60} height={60} />
          <span className="text-xl font-bold text-gray-500">Eye Check</span>
        </SheetTitle>
        <div className="h-full overflow-y-auto flex flex-col justify-center">
          <UserSettings
            user={user}
            isnotification={isnotification}
            setIsnotification={setIsnotification}
            clinicNotifyBeforeDays={clinicNotifyBeforeDays}
            setClinicNotifyBeforeDays={setClinicNotifyBeforeDays}
            contactNotifyBeforeDays={contactNotifyBeforeDays}
            setContactNotifyBeforeDays={setContactNotifyBeforeDays}
          />
          <ContactClinicSettings
            user={user}
            contactCycle={contactCycle}
            setContactCycle={setContactCycle}
            clinicCycle={clinicCycle}
            setClinicCycle={setClinicCycle}
          />
        </div>
        <div className="flex py-2 border-t border-gray-200 bg-gray-20 justify-between items-center">
          <div className="flex flex-col ml-4">
            <span className="text-base text-gray-600 truncate">
              {user.user_metadata.name}
            </span>
            <span className="text-base text-gray-600 truncate">
              {user.email}
            </span>
          </div>
          <LogoutDialog handleLogout={handleLogout} isLoading={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
