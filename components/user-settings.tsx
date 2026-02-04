"use client";

import { Bell } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { UserSettingsProps } from "@/types";

export default function UserSettings({
  isnotification,
  setIsnotification,
  clinicNotifyBeforeDays,
  setClinicNotifyBeforeDays,
  contactNotifyBeforeDays,
  setContactNotifyBeforeDays,
}: UserSettingsProps) {
  return (
    <>
      <div className="flex items-center ml-4 gap-2 mb-2">
        <Bell size={25} color="gray" />
        <h2 className="text-lg font-bold">通知設定</h2>
      </div>
      <div className="px-2 flex flex-col gap-6 mx-4">
        <div className="flex items-center gap-6">
          <label htmlFor="isnotification">通知を受け取る</label>
          {/* switchで状態を変換しているがDBの値は変わっていないので同期するようにしなければならない */}
          <Switch
            id="isnotification"
            checked={isnotification}
            onCheckedChange={setIsnotification}
            className="border-1 border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contactNotifyBeforeDays">
            コンタクト交換の通知前日数
          </label>
          <Input
            id="contactNotifyBeforeDays"
            type="number"
            value={contactNotifyBeforeDays}
            disabled={!isnotification}
            onChange={(e) => setContactNotifyBeforeDays(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="clinicNotifyBeforeDays">眼科受診の通知前日数</label>
          <Input
            id="clinicNotifyBeforeDays"
            type="number"
            value={clinicNotifyBeforeDays}
            disabled={!isnotification}
            onChange={(e) => setClinicNotifyBeforeDays(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}
