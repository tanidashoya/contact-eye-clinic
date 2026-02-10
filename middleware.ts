//ユーザーからリクエストがあったときにますmiddlewareを実行する。
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

//updateSession関数を実行する。
//updateSession関数は、Cookieに保存されている情報を取り出して、supabase用のclientを作る
//Cookieが有効化を確認
/*
つまり・・・
ユーザーのブラウザに
そのアプリ用の Supabase 認証情報（Cookie）が保存されているか確認し、
有効ならそのまま「ログイン済み」として扱えるようにする仕組み。
*/
//requestの中身：URL、HTTPメソッド（GET、POSTなど）、Cookie、ヘッダー、ボディなど
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

//この middleware を、どのリクエストに対して実行するかを指定する設定
/*
matcher とは何か
URLパスに対するマッチ条件
正規表現っぽい書き方
マッチしたリクエストだけ middleware 実行
*/
//matcherの条件を分解
//"/" から始まる全パス
//ただし「次に該当するものは除外」⇒supabaseの認証を通さない
/*
api/cron
_next/static
_next/image
favicon.ico
画像ファイル（svg, png, jpg, jpeg, gif, webp）
👉 これら以外は全部 middleware を通す
*/
//api/cronは認証不要(cron jobはvercelで実行されるため、middlewareを通さない)⇒しかし、別の認証キーを必ず入れるべき
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

2️⃣ middleware が Cookie を読む

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
