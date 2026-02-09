"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

interface OneSignalIdentifyProps {
  userId: string;
}

export default function OneSignalIdentify({ userId }: OneSignalIdentifyProps) {
  useEffect(() => {
    if (!userId) return;

    const identifyUser = async () => {
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
        });

        // 通知許可をリクエスト（まだ許可されていない場合）
        const permission = OneSignal.Notifications.permission;
        if (!permission) {
          await OneSignal.Notifications.requestPermission();
        }

        // ユーザーIDを紐づけ
        await OneSignal.login(userId);
      } catch (error) {
        console.error("OneSignal initialization error:", error);
      }
    };

    identifyUser();
  }, [userId]);

  return null;
}
