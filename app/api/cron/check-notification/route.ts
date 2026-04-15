// 毎日定時に実行され、通知対象ユーザーを取得してプッシュ通知を送信するCron用API
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/admin";
import { addDaysToDateString, getTodayJstDateString } from "@/lib/date";

export async function GET(req: NextRequest) {
  // Supabaseクライアントを関数内で初期化（サーバーレス環境での環境変数読み込みを確実にする）
  const supabase = createServiceRoleClient();
  // 本番環境ではCRON_SECRETで認証チェック
  //VercelCronは定期実行時に指定したヘッダーを付けてHTTPリクエストを送る
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set" },
      { status: 500 }
    );
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 今日の日付をJST基準で取得（YYYY-MM-DD形式）
  // Vercel CronはUTCで実行されるため、明示的にJSTに変換する
  const todayStr = getTodayJstDateString();

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
      // next_due_at をJSTの暦日として扱い、通知日を計算する
      const notifyDateStr = addDaysToDateString(
        contactEvent.next_due_at,
        -settings.contact_notify_before_days
      );

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
      const notifyDateStr = addDaysToDateString(
        clinicEvent.next_due_at,
        -settings.clinic_notify_before_days
      );

      if (notifyDateStr === todayStr) {
        notifications.push({
          userId: settings.user_id,
          eventType: "clinic",
          beforeDays: settings.clinic_notify_before_days,
        });
      }
    }
  }

  // 通知を送信（1件の失敗で全停止しないよう、エラーを記録して続行）
  const errors: string[] = [];

  for (const notification of notifications) {
    const isContact = notification.eventType === "contact";
    const title = isContact
      ? "コンタクト交換リマインダー"
      : "眼科受診リマインダー";
    const message = isContact
      ? `コンタクト交換予定日の${notification.beforeDays}日前です！`
      : `眼科受診予定日の${notification.beforeDays}日前です！`;

    try {
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

      if (response.ok) {
        notifiedCount++;
      } else {
        const errorMsg = `ユーザーID: ${notification.userId}: ${response.statusText}`;
        console.error(`通知送信失敗: ${errorMsg}`);
        errors.push(errorMsg);
      }
    } catch (error) {
      const errorMsg = `ユーザーID: ${notification.userId}: ${error instanceof Error ? error.message : "不明なエラー"}`;
      console.error(`通知送信エラー: ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    checked_date: todayStr,
    targets: notifications.length,
    notified: notifiedCount,
    failed: errors.length,
    errors,
  });
}
