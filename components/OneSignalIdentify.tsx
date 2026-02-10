"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import updateNotifySettings from "@/app/(private)/action/update-notify-settings";
import { User } from "@supabase/supabase-js";

interface OneSignalIdentifyProps {
  userId: string;
  user: User;
}

let isOneSignalInitialized = false;

export default function OneSignalIdentify({
  userId,
  user,
}: OneSignalIdentifyProps) {
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

          // 通知許可の変更を監視（ユーザーがブラウザ設定などで後から変更した場合にも対応）
          OneSignal.Notifications.addEventListener(
            "permissionChange",
            async (permission: boolean) => {
              if (permission) {
                await updateNotifySettings({ user, notifyEnabled: true });
                window.dispatchEvent(
                  new CustomEvent("onesignal-permission-granted")
                );
              }
            }
          );

          // 通知許可をリクエスト（まだ許可されていない場合）
          const permission = OneSignal.Notifications.permission;
          if (!permission) {
            await OneSignal.Notifications.requestPermission();

            // requestPermission後に許可されたかチェック
            if (OneSignal.Notifications.permission) {
              await updateNotifySettings({ user, notifyEnabled: true });
              window.dispatchEvent(
                new CustomEvent("onesignal-permission-granted")
              );
            }
          }
        }

        // ユーザーIDを紐づけ（アカウント切り替え時も実行される）
        await OneSignal.login(userId);
      } catch (error) {
        console.error("OneSignal error:", error);
      }
    };

    identifyUser();
  }, [userId, user]);

  return null;
}
