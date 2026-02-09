"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

interface OneSignalIdentifyProps {
  userId: string;
}

let isOneSignalInitialized = false;

export default function OneSignalIdentify({ userId }: OneSignalIdentifyProps) {
  useEffect(() => {
    if (!userId) return;

    const identifyUser = async () => {
      try {
        // 初回のみ init() を実行
        if (!isOneSignalInitialized) {
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: "/" },
            serviceWorkerPath: "/OneSignalSDKWorker.js",
          });
          isOneSignalInitialized = true;

          // 通知許可をリクエスト（まだ許可されていない場合）
          const permission = OneSignal.Notifications.permission;
          if (!permission) {
            await OneSignal.Notifications.requestPermission();
          }
        }

        // ユーザーIDを紐づけ（アカウント切り替え時も実行される）
        await OneSignal.login(userId);
      } catch (error) {
        console.error("OneSignal error:", error);
      }
    };

    identifyUser();
  }, [userId]);

  return null;
}
