// ユーザーからリクエストがあったときにまず proxy を実行する。
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// updateSession 関数を実行する。
// updateSession 関数は、Cookie に保存されている情報を取り出して、supabase 用の client を作る
// Cookie が有効かを確認
/*
つまり・・・
ユーザーのブラウザに
そのアプリ用の Supabase 認証情報（Cookie）が保存されているか確認し、
有効ならそのまま「ログイン済み」として扱えるようにする仕組み。
*/
// request の中身：URL、HTTP メソッド（GET、POST など）、Cookie、ヘッダー、ボディなど
//macherのパターンに入っているものはupdateSessionを実行
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// この proxy を、どのリクエストに対して実行するかを指定する設定
/*
matcher とは何か
URL パスに対するマッチ条件
正規表現っぽい書き方
マッチしたリクエストだけ proxy 実行
*/
// matcher の条件を分解
// "/" から始まる全パス
// ただし「次に該当するものは除外」⇒ supabase の認証を通さない
/*
api/cron
_next/static
_next/image
favicon.ico
画像ファイル（svg, png, jpg, jpeg, gif, webp）
👉 これら以外は全部 proxy を通す
*/
// api/cron は認証不要（cron job は Vercel で実行されるため、proxy を通さない）⇒ しかし、別の認証キーを必ず入れるべき
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/cron (Cron Job API - 認証不要)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/*
処理の流れ（感覚ベース）

1️⃣ ブラウザがリクエストを送る
（Cookie は自動で一緒に送られる）

2️⃣ proxy が Cookie を読む

3️⃣ Supabase Client が
「このトークンまだ使える？」
「期限切れなら更新できる？」
を確認

4️⃣ OKなら
ユーザーはログイン済み扱い
次の処理へ進む

5️⃣ ダメなら
未ログイン扱い
リダイレクト or user=null
*/
