"use client";

import { Bell } from "lucide-react";
import { Switch } from "./ui/switch";
import NumberInput from "./number-input";
import { UserSettingsProps } from "@/types";
import updateNotifySettings from "@/app/(private)/action/update-notify-settings";
import OneSignal from "react-onesignal";

export default function UserSettings({
  user,
  isnotification,
  setIsnotification,
  clinicNotifyBeforeDays,
  setClinicNotifyBeforeDays,
  contactNotifyBeforeDays,
  setContactNotifyBeforeDays,
}: UserSettingsProps) {
  const handleUpdateNotifySettings = async () => {
    const newValue = !isnotification;
    setIsnotification(newValue);
    const result = await updateNotifySettings({
      user,
      notifyEnabled: newValue,
    });
    // エラーが発生した場合は状態を元に戻す
    if (result?.error) {
      setIsnotification(!newValue);
      return;
    }
    // 👇 DB更新成功後に OneSignal を同期
    if (newValue) {
      // 通知ON
      await OneSignal.Notifications.requestPermission();
    } else {
      // 通知OFF
      await OneSignal.logout();
    }
  };
  return (
    <>
      <div className="flex items-center ml-4 gap-2 mb-4">
        <Bell size={25} color="gray" />
        <h2 className="text-lg font-bold">通知設定</h2>
      </div>
      <div className="px-2 flex flex-col gap-4 mx-4 mb-2">
        <div className="flex items-center gap-6">
          <label htmlFor="isnotification">通知を受け取る</label>
          {/* switchで状態を変換しているがDBの値は変わっていないので同期するようにしなければならない */}
          <Switch
            size="lg"
            id="isnotification"
            checked={isnotification}
            onCheckedChange={handleUpdateNotifySettings}
            className="border-1 border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contactNotifyBeforeDays">
            コンタクト交換の通知前日数
          </label>
          <NumberInput
            id="contactNotifyBeforeDays"
            numberValue={contactNotifyBeforeDays}
            disabled={!isnotification}
            onValueChange={setContactNotifyBeforeDays}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="clinicNotifyBeforeDays">眼科受診の通知前日数</label>
          <NumberInput
            id="clinicNotifyBeforeDays"
            numberValue={clinicNotifyBeforeDays}
            disabled={!isnotification}
            onValueChange={setClinicNotifyBeforeDays}
          />
        </div>
      </div>
    </>
  );
}
