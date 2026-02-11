//updateSession関数は、Cookieに保存されている情報を取り出して、supabase用のclientを作る関数
/*
全体像（まず俯瞰）
リクエストが来るたびに、次の流れをやっています。
ブラウザから送られてきた Cookie を読む
その Cookie を使って Supabase のサーバー用クライアントを作る
Supabase に「この人ログインしてる？」と確認する
ログインしてなければ /login にリダイレクト
必要なら Cookie を更新してレスポンスに載せる
*/

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  //「この request を次に渡すための response」を仮で作る
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  //Cookieを使ってSupabaseのサーバー用クライアントを作る'(まだ認証は確定していない)
  //第3引数は「Supabase が Cookie をどう読み、どう書き戻せばいいかを教える設定」
  //getAll():Cookieを取得(今のリクエストに含まれているCookieをすべて取得)
  //
  /*
  createServerClient は
  サーバー側で Supabase の認証を扱うためのクライアントを生成する関数で、
  その生成時に「Cookie をどう読むか」「Cookie をどう書き戻すか」
  という 関数 を渡している。
  */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    //第三引数は設定オブジェクトgetAll(読み取り用の関数),setAll(書き込み用の関数)をsupabaseに渡している
    {
      cookies: {
        getAll() {
          //SupabaseはCookie（Cookieに入っているaccess tokenやrefresh tokenを取得）を取得
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          //Cookieを書き込み
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  //supabase.auth.getClaims()　⇒ログイン状態の確定
  /*
1. Cookie から access token を読む
2. access token は有効？
   ├ YES → OK
   └ NO →
       refresh token はある？(「access token を作り直すための長期用の鍵」)
         ├ YES → 新しい access token を発行（←重要）
         └ NO → 認証失敗
3. 結果を data.claims に入れる
4. 必要なら Cookie を書き換える
  */
  const { data } = await supabase.auth.getClaims(); //JWTトークンの中身を取得して確認
  const user = data?.claims;

  //ログインしてなければ /login にリダイレクト
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/signup")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    //request.nextUrl.clone() ⇒ request.nextUrlは読み取り専用。
    //requet.nexttUrl:ユーザーが今アクセスしようとしている URL をNext.js 用に扱いやすくしたオブジェクト
    //redirect は URL 全体を見て遷移する。その URL の中で、今回は pathname だけを変えている（path）
    /*
    pathname を変えると「どのページに行くか」が決まり、クエリ（?xxx=yyy）が付いていてもそれは“付加情報”として一緒に遷移するだけ。
    */
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

/*
request.nextUrl の正体は NextURL オブジェクトの主なプロパティ
| プロパティ          | 中身                                          |
| -------------- | ------------------------------------------- |
| `origin`       | `https://example.com`                       |
| `href`         | `https://example.com/dashboard?tab=profile` |
| `pathname`     | `/dashboard`                                |　⇒　どのページなのかを決めている
| `search`       | `?tab=profile`                              |
| `searchParams` | `URLSearchParams { tab: "profile" }`        |
| `host`         | `example.com`                               |
| `protocol`     | `https:`                                    |

*/
