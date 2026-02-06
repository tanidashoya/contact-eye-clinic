"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { CalendarCog } from "lucide-react";
import { useState } from "react";
import { SettingSheetClientProps } from "@/types";

import UserSettings from "./user-settings";
import ContactClinicSettings from "./contact-clinic-settings";

export default function SettingSheetClient({
  userId,
  userSettings,
  contactSettings,
  clinicSettings,
}: SettingSheetClientProps) {
  const [isnotification, setIsnotification] = useState(
    userSettings.notify_enabled,
  );
  const [clinicNotifyBeforeDays, setClinicNotifyBeforeDays] = useState(
    userSettings.clinic_notify_before_days,
  );
  const [contactNotifyBeforeDays, setContactNotifyBeforeDays] = useState(
    userSettings.contact_notify_before_days,
  );
  const [contactCycle, setContactCycle] = useState(contactSettings.cycle_days);
  const [clinicCycle, setClinicCycle] = useState(clinicSettings.cycle_days);

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" asChild>
          <CalendarCog size={30} color="gray" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[80%]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-center">
            設定変更
          </SheetTitle>
          {/* <SheetDescription>This action cannot be undone.</SheetDescription> */}
        </SheetHeader>
        <UserSettings
          isnotification={isnotification}
          setIsnotification={setIsnotification}
          clinicNotifyBeforeDays={clinicNotifyBeforeDays}
          setClinicNotifyBeforeDays={setClinicNotifyBeforeDays}
          contactNotifyBeforeDays={contactNotifyBeforeDays}
          setContactNotifyBeforeDays={setContactNotifyBeforeDays}
        />
        <ContactClinicSettings
          userId={userId}
          contactCycle={contactCycle}
          setContactCycle={setContactCycle}
          clinicCycle={clinicCycle}
          setClinicCycle={setClinicCycle}
        />
      </SheetContent>
    </Sheet>
  );
}
