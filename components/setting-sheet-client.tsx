"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Bell, CalendarCog } from "lucide-react";
import { useState } from "react";
import { SettingSheetClientProps } from "@/types";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import UserSettings from "./user-settings";
import ContactClinicSettings from "./contact-clinic-settings";

export default function SettingSheetClient({
  userId,
  userSettings,
  contactSettings,
  clinicSettings,
}: SettingSheetClientProps) {
  const [isnotification, setIsnotification] = useState(
    userSettings?.notify_enabled ?? false,
  );
  const [clinicNotifyBeforeDays, setClinicNotifyBeforeDays] = useState(
    userSettings?.clinic_notify_before_days ?? 14,
  );
  const [contactNotifyBeforeDays, setContactNotifyBeforeDays] = useState(
    userSettings?.contact_notify_before_days ?? 1,
  );
  const [contactCycle, setContactCycle] = useState(
    contactSettings?.cycle_days ?? 14,
  );
  const [eyeCareCycle, setEyeCareCycle] = useState(
    clinicSettings?.cycle_days ?? 180,
  );

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
          contactCycle={contactCycle}
          setContactCycle={setContactCycle}
          eyeCareCycle={eyeCareCycle}
          setEyeCareCycle={setEyeCareCycle}
        />
      </SheetContent>
    </Sheet>
  );
}
