//Supabase の user.id（＝OneSignal の External User ID）を指定して、
// そのユーザーに対して、指定したタイトル・メッセージの Web Push 通知を送る API
//手動実行用なので、使われてはいない。
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, title, message, url } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json(
      { error: "userId, title, message は必須です" },
      { status: 400 }
    );
  }

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
        external_id: [userId],
      },
      headings: { ja: title, en: title },
      contents: { ja: message, en: message },
      url: url || undefined,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "通知の送信に失敗しました", details: data },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
