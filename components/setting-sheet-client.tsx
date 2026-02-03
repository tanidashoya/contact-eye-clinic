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

export default function SettingSheetClient({
  userId,
  userSettings,
  contactSettings,
  clinicSettings,
}: SettingSheetClientProps) {
  const [isnotification, setIsnotification] = useState(
    userSettings?.notify_enabled,
  );
  const [clinicNotifyBeforeDays, setClinicNotifyBeforeDays] = useState(
    userSettings?.clinic_notify_before_days,
  );
  const [contactNotifyBeforeDays, setContactNotifyBeforeDays] = useState(
    userSettings?.contact_notify_before_days,
  );
  const [contactCycle, setContactCycle] = useState(contactSettings?.cycle_days);
  const [eyeCareCycle, setEyeCareCycle] = useState(clinicSettings?.cycle_days);

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" asChild>
          <CalendarCog size={30} color="gray" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">設定を変更</SheetTitle>
          {/* <SheetDescription>This action cannot be undone.</SheetDescription> */}
        </SheetHeader>
        {/* ユーザーの設定項目 */}
      </SheetContent>
    </Sheet>
  );
}
