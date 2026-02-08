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
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      });

      await OneSignal.login(userId);
    };

    identifyUser();
  }, [userId]);

  return null;
}
