// 毎日定時に実行され、通知対象ユーザーを取得してプッシュ通知を送信するCron用API
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/admin";

//Supabaseのサービスロールキーを使用して、データベースにアクセス
const supabase = createServiceRoleClient();

export async function GET(req: NextRequest) {
  // 本番環境ではCRON_SECRETで認証チェック
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 今日の日付を取得（YYYY-MM-DD形式）
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // 通知が有効なユーザーの設定を取得
  const { data: userSettings, error: settingsError } = await supabase
    .from("user_settings")
    .select("user_id, contact_notify_before_days, clinic_notify_before_days")
    .eq("notify_enabled", true);

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  if (!userSettings || userSettings.length === 0) {
    return NextResponse.json({
      success: true,
      message: "通知対象ユーザーがいません",
      notified: 0,
    });
  }

  // 各ユーザーの最新イベントを取得して通知判定
  let notifiedCount = 0;
  const notifications: {
    userId: string;
    eventType: string;
    beforeDays: number;
  }[] = [];

  // 各ユーザーの通知設定を取得して通知判定
  for (const settings of userSettings) {
    // コンタクト交換イベントをチェック
    // 最新のコンタクト交換イベントの next_due_at を取得
    const { data: contactEvent } = await supabase
      .from("events")
      .select("next_due_at")
      .eq("user_id", settings.user_id)
      .eq("event_type", "contact")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // コンタクト交換イベントの next_due_at が存在する場合
    if (contactEvent?.next_due_at) {
      const notifyDate = new Date(contactEvent.next_due_at);
      //次回交換予定日(next_due_at)から、設定された“何日前”(contact_notify_before_days)を引いて、通知日（notifyDate）を計算している
      notifyDate.setDate(
        notifyDate.getDate() - settings.contact_notify_before_days
      );
      const notifyDateStr = notifyDate.toISOString().split("T")[0];

      // 通知日（notifyDateStr）が今日の日付（todayStr）と一致する場合、通知対象として配列に追加
      if (notifyDateStr === todayStr) {
        notifications.push({
          userId: settings.user_id,
          eventType: "contact",
          beforeDays: settings.contact_notify_before_days,
        });
      }
    }

    // 眼科受診イベントをチェック
    const { data: clinicEvent } = await supabase
      .from("events")
      .select("next_due_at")
      .eq("user_id", settings.user_id)
      .eq("event_type", "clinic")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (clinicEvent?.next_due_at) {
      const notifyDate = new Date(clinicEvent.next_due_at);
      notifyDate.setDate(
        notifyDate.getDate() - settings.clinic_notify_before_days
      );
      const notifyDateStr = notifyDate.toISOString().split("T")[0];

      if (notifyDateStr === todayStr) {
        notifications.push({
          userId: settings.user_id,
          eventType: "clinic",
          beforeDays: settings.clinic_notify_before_days,
        });
      }
    }
  }

  // 通知を送信
  for (const notification of notifications) {
    const isContact = notification.eventType === "contact";
    const title = isContact
      ? "コンタクト交換リマインダー"
      : "眼科受診リマインダー";
    const message = isContact
      ? `コンタクト交換予定日の${notification.beforeDays}日前です！`
      : `眼科受診予定日の${notification.beforeDays}日前です！`;

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        target_channel: "push",
        include_aliases: {
          external_id: [notification.userId],
        },
        headings: { ja: title, en: title },
        contents: { ja: message, en: message },
        url: "/",
      }),
    });

    if (response.ok) notifiedCount++;
  }

  return NextResponse.json({
    success: true,
    checked_date: todayStr,
    targets: notifications.length,
    notified: notifiedCount,
  });
}
