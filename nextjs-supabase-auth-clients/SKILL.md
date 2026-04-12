---
name: nextjs-supabase-auth-clients
description: Next.js App Router で @supabase/ssr を使った認証基盤を構築・整理・レビューするときに使う。browser、server、middleware/proxy、service role の Supabase クライアントを責務ごとに分離したい場合、認証まわりの土台を feature code から切り離したい場合、unsafe なキー利用を防ぎたい場合、ディレクトリ構造と session refresh の実装を標準化したい場合に適用する。
---

# Next.js Supabase Auth Clients

## 概要

実行環境と権限レベルごとに Supabase クライアントを分離する。クライアント生成関数は薄く保ち、認証セッションの更新は専用の middleware または proxy モジュールに集約し、`service_role` はサーバー専用コードに閉じ込める。

この skill は `Next.js App Router` で `@supabase/ssr` を使い、Cookie ベースで Supabase 認証を扱う構成を前提とする。純粋なクライアントサイドアプリ、Cookie を使わない認証構成、`service_role` をブラウザに露出させる設計には使わない。

## 推奨ディレクトリ構造

まず次の構造を基準にする。

```text
utils/
  supabase/
    client.ts
    server.ts
    admin.ts
    middleware.ts
proxy.ts
```

既存プロジェクトが `lib/` など別の共通ディレクトリを使っているなら、その規約を維持する。重要なのは場所より責務分離と import の一貫性である。

各ファイルの責務は次のとおり。

- `client.ts`: ブラウザ専用。公開 URL と publishable key を使う。
- `server.ts`: Server Component、Server Action、Route Handler で、ユーザー文脈の Supabase アクセスに使う。
- `admin.ts`: `service_role` 専用。cron、webhook、管理系バッチ、RLS を意図的に迂回する処理に限定する。
- `middleware.ts`: セッション更新と Cookie 同期の低レベル処理を持つ。
- ルートの `proxy.ts` または `middleware.ts`: Next.js の入口。`updateSession()` を呼ぶだけの薄いファイルに保つ。

## 必須環境変数

最低限、次を前提とする。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

次のルールを守る。

- `SUPABASE_SERVICE_ROLE_KEY` をブラウザコードで使わない。
- Client Component から `admin.ts` を import しない。
- `admin.ts` は `server-only` 宣言の有無にかかわらず、常にサーバー専用として扱う。
- 可能なら生成済みの `Database` 型を使ってクライアントを型付けする。

## クライアント生成の基本形

クライアント生成関数は薄く保つ。feature 固有の業務ロジックを混ぜない。

### ブラウザ用クライアント

```ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

### サーバー用クライアント

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie を更新できない文脈から呼ばれた場合は無視する。
          }
        },
      },
    },
  );
}
```

### service role 用クライアント

```ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

## セッション更新パターン

セッション更新は feature code から分離する。middleware または proxy 層で request 単位の server client を作成し、Supabase に Cookie を読ませて更新させ、その Cookie を持った response をそのまま返す。

基本形は次のようにする。

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return response;
}
```

この層では次を守る。

- auth refresh 用の server client をグローバル変数にしない。
- `createServerClient(...)` と認証更新呼び出しの間に無関係な処理を挟まない。
- `NextResponse.next(...)` を作り直したら Cookie を必ず引き継ぐ。
- 低レベルの Cookie 同期処理と、アプリ固有のリダイレクト判定を必要以上に混ぜない。

## ルート入口の実装方針

ルートの入口ファイル名は、そのリポジトリの既存規約に合わせる。

- 既存が `proxy.ts` なら `proxy.ts` を維持する。
- 既存が `middleware.ts` なら `middleware.ts` を維持する。
- 既存プロジェクトで移行中でない限り、入口ファイル名を不用意に変更しない。

最小構成は次のとおり。

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

`matcher` はアプリごとに調整する。よく除外するのは次の種類。

- 静的アセット
- image optimization の経路
- favicon や manifest
- public に置いた worker ファイル
- ブラウザの認証 Cookie を使わない cron や webhook

除外は最小限に留める。除外しすぎると、必要なルートで session refresh が走らず、原因の見えにくい認証不整合を生む。

## 各クライアントの使い分け

`client.ts` を使う場面:

- Client Component
- ブラウザ起点の認証処理
- ブラウザ側 realtime subscription

`server.ts` を使う場面:

- 現在のログインユーザー文脈で読む Server Component
- Server Action
- ログインユーザーの権限で動く Route Handler

`admin.ts` を使う場面:

- 定期実行ジョブ
- 内部保守 API
- 信頼済み webhook
- RLS を意図的に迂回する管理操作

「現在のログインユーザーの代理として処理する」のが目的なら、まず `server.ts` を使う。権限昇格が本当に必要な場合だけ `admin.ts` を使う。

## リダイレクト方針

リダイレクト条件そのものはアプリ固有として扱う。共通化するのは考え方であり、具体的なパスではない。

典型的な方針は次の形。

- 未認証ユーザーは保護ルートからログイン画面へ送る。
- 認証済みユーザーは login や signup 画面から追い出す。
- 認証不要の特殊ルートは、可能なら matcher で除外する。

`/login`、`/signup`、`/dashboard` のような具体パスはテンプレートに固定しない。適用先の router 構成を確認してから決める。

## レビュー時の確認項目

この pattern を導入またはレビューするときは、少なくとも次を確認する。

- browser client factory が 1 つに集約されている。
- Cookie ベースの user context 用 server client factory が 1 つに集約されている。
- service role アクセスが専用モジュールに隔離されている。
- クライアントバンドルから `admin.ts` を import していない。
- middleware または proxy が、Cookie 更新済みの response を返している。
- ブラウザセッションを使うルートで auth refresh が実行される。
- cron や machine-to-machine の経路がブラウザ Cookie に依存していない。
- 各 feature が実行環境に合ったクライアントを import している。

## よくある失敗

- 通常のユーザー処理に `service_role` を使ってしまう。
- サーバーコードで browser client を使ってしまう。
- Cookie 同期、リダイレクト判定、feature query を 1 つの巨大 middleware に詰め込む。
- feature ごとに Supabase client をその場生成し続けてしまう。
- `admin.ts` に業務ロジックまで詰め込んでしまう。
- `matcher` の除外を増やしすぎて、ランダムに見える認証不整合を作る。

## 出力時の期待値

この skill を使うときは、最終的に次の状態を目指す。

- 実行環境ごとに責務分離された Supabase client 構成
- 専用の session refresh helper
- 薄い root の proxy または middleware
- サーバー専用に閉じた service-role client
- アプリ固有に調整すべき redirect 条件と matcher 除外点の明示
