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
      // 初回のみ init() を実行（１ブラウザ一回が原則）
      //onesignalの初期化()⇒init は“通知機能の電源ON”
      //appId:*「どの OneSignal アプリの通知か」**を識別するID
      //allowLocalhostAsSecureOrigin: 通常、Web Push 通知は HTTPS 必須。ただし localhost だけは例外的に許可できる（開発用）
      //serviceWorkerParam:Service Worker が影響を及ぼす URL 範囲(このサイト全体でこの通知機能は使える)
      //serviceWorkerPath: 通知を裏で受信するための Service Worker ファイルの場所
      /*
        通知は：
        ページを開いていなくても
        ブラウザが閉じていても
        Service Worker が受け取る
        ⇒Service Worker はバックグラウンドで動作し、通知を受信してからユーザーに表示する
        */
      try {
        if (!isOneSignalInitialized) {
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: "/" },
            serviceWorkerPath: "/OneSignalSDKWorker.js",
          });
          isOneSignalInitialized = true; //SPA遷移での二重init帽子

          // 通知許可の変更を監視（ユーザーがブラウザ設定などで後から変更した場合にも対応）
          //監視イベント（ユーザーが通知許可を変更したときに発火:permissionChange）
          //第二引数callback関数：permission(通知許可されたかどうか)を受け取って、通知許可されたらupdateNotifySettingsを実行（DB更新）
          //window.dispatchEvent(自分で作ったイベント【引数で渡されたイベントを発火】)
          //new CustomEvent("onesignal-permission-granted")：自分で作ったイベント(通知許可されたときに発火)
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
        }

        // ユーザーIDを紐づけ（アカウント切り替え時も実行される）
        // login()を先に実行することで、通知許可時にOneSignal上でこのユーザーのサブスクリプションとして直接登録される
        await OneSignal.login(userId);

        // 通知許可をリクエスト（まだ許可されていない場合）
        // login()後に実行することで、匿名サブスクリプションの作成を防ぐ
        //OneSignal.Notifications.requestPermission()：ブラウザ標準の「通知を許可しますか？」ダイアログを表示させるためのメソッド。
        //実際に開くのは OneSignal ではなくブラウザ。
        //ブラウザの通知許可状態(OneSignal.Notifications.permission)はOneSignalのlogin/logoutとは独立してブラウザに保存され
        const permission = OneSignal.Notifications.permission;
        if (!permission) {
          await OneSignal.Notifications.requestPermission();

          // requestPermission後に許可されたかチェック⇒通知が許可されたらDBを更新
          if (OneSignal.Notifications.permission) {
            await updateNotifySettings({ user, notifyEnabled: true });
            window.dispatchEvent(
              new CustomEvent("onesignal-permission-granted")
            );
          }
        }
      } catch (error) {
        console.error("OneSignal error:", error);
      }
    };

    identifyUser();
  }, [userId, user]);

  return null;
}
