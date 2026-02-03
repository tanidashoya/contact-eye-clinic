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

export default function SettingSheetClient() {
  const [isnotification, setIsnotification] = useState(false);
  const [contactCycle, setContactCycle] = useState(14);
  const [eyeCareCycle, setEyeCareCycle] = useState(180);

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
