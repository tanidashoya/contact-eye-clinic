# Eye Check

Eye Check は、コンタクトレンズ交換日と眼科受診日を記録し、次回予定日を管理するための Next.js アプリケーションです。  
ユーザーごとにイベント周期を保持し、Web Push 通知によって「交換日が近い」「受診日が近い」を知らせる構成になっています。

この README は、現在の実装を前提に「このアプリは何をしているか」「どのファイルが何を担当しているか」「どのデータが必要か」を網羅的に理解するためのドキュメントです。

## 1. アプリ概要

このアプリは、以下 2 種類の定期イベントを管理します。

- `contact`: コンタクトレンズ交換
- `clinic`: 眼科受診

ユーザーはログイン後、ホーム画面でそれぞれの最新記録を確認できます。

- 前回いつ実施したか
- 次回予定日がいつか
- 今回実施したことをワンタップで記録できる

設定シートからは次の情報を変更できます。

- プッシュ通知の ON / OFF
- コンタクト交換周期
- 眼科受診周期
- 通知前日数の入力値

また、Vercel Cron から毎日通知チェック API を叩き、該当ユーザーに OneSignal 経由で Web Push 通知を送ります。

## 2. 主要機能

### 認証

- Supabase Auth を利用したメールアドレス / パスワード認証
- サインアップ機能
- ログイン機能
- ログアウト機能
- 未認証ユーザーは `proxy.ts` と Supabase セッション更新処理により `/login` へリダイレクト

### イベント記録

- コンタクト交換の記録
- 眼科受診の記録
- 記録時点の日付を `occurred_at` に保存
- 現在の設定周期 (`cycle_days`) を使って `next_due_at` を計算して保存

### 設定管理

- 通知有効 / 無効の切り替え
- コンタクト交換周期の更新
- 眼科受診周期の更新
- 通知前日数の入力 UI

### 通知

- OneSignal Web Push を使用
- ユーザー ID を OneSignal の External User ID として紐付け
- Vercel Cron が日次で通知判定 API を実行
- `next_due_at - 通知前日数` が当日と一致した場合に通知送信

## 3. 画面構成

### `/login`

役割:
ログイン画面です。

主な処理:

- メールアドレス / パスワード入力
- `app/(auth)/login/action.ts` の `login` を呼び出し
- ログイン前に `OneSignal.logout()` を実行し、前ユーザーの通知識別情報をリセット
- クエリパラメータの `error` を見てトースト表示

関連ファイル:

- `app/(auth)/login/page.tsx`
- `app/(auth)/login/action.ts`

### `/signup`

役割:
新規登録画面です。

主な処理:

- 名前 / メールアドレス / パスワード入力
- Supabase Auth の `signUp`
- `user_metadata.name` を保持

関連ファイル:

- `app/(auth)/signup/page.tsx`
- `app/(auth)/signup/action.ts`

### `/`

役割:
ログイン後のメイン画面です。

表示内容:

- コンタクト交換の前回日付と次回予定日
- 眼科受診の前回日付と次回予定日
- それぞれの記録ボタン

主な処理:

- `getNewEvents(user.id)` で各イベント種別の最新 1 件を取得
- 記録ボタン押下時に Server Action で `events` へ INSERT
- INSERT 後に `revalidatePath("/")` で画面更新

関連ファイル:

- `app/(private)/page.tsx`
- `components/date-display.tsx`
- `app/(private)/action/get-new-event.ts`
- `app/(private)/action/insert-contact-event.ts`
- `app/(private)/action/insert-eyecare-event.ts`

### 設定シート

役割:
ログイン後にヘッダー左上のアイコンから開く設定 UI です。

表示内容:

- 通知設定
- コンタクト交換周期
- 眼科受診周期
- ユーザー名 / メールアドレス
- ログアウトダイアログ

主な処理:

- `user_settings` を取得
- `event_settings` の `contact` / `clinic` を取得
- 周期変更時に即座に DB 更新
- 通知トグル変更時に `user_settings.notify_enabled` を更新

関連ファイル:

- `components/header.tsx`
- `components/setting-sheet.tsx`
- `components/setting-sheet-client.tsx`
- `components/user-settings.tsx`
- `components/contact-clinic-settings.tsx`
- `components/logout-dialog.tsx`

## 4. 技術スタック

- Framework: Next.js 16.1.6 (App Router)
- Language: TypeScript
- UI: React 19, Tailwind CSS v4, Radix UI, shadcn/ui ベースの UI コンポーネント
- Auth / DB: Supabase
- Push Notification: OneSignal
- Toast: Sonner
- Hosting 想定: Vercel

## 5. ディレクトリ構成

```text
app/
  (auth)/
    login/
    signup/
  (private)/
    action/
  api/
    cron/check-notification/
    send-notification/
components/
  ui/
lib/
types/
utils/
  supabase/
public/
```

補足:

- `(auth)` と `(private)` は Route Group であり、URL パスには含まれません。
- API は `app/api/...` に配置されています。
- Supabase クライアント生成処理は `utils/supabase/*` に集約されています。

## 6. データモデル

`database.types.ts` から確認できる主要テーブルは次の 3 つです。

### `events`

イベント履歴を保存するテーブルです。

主なカラム:

- `id`
- `user_id`
- `event_type`
- `occurred_at`
- `next_due_at`
- `cycle_days`
- `created_at`

意味:

- 1 回の「交換した」「受診した」を 1 レコードとして保持します。
- 一覧ではなく最新 1 件だけを取得して、現在状態の表示に使っています。

### `event_settings`

イベント種別ごとの周期設定を持つテーブルです。

主なカラム:

- `user_id`
- `event_type`
- `cycle_days`
- `created_at`
- `updated_at`

意味:

- `contact` 用の周期
- `clinic` 用の周期

この設定値を使って、イベント記録時の `next_due_at` を計算します。

### `user_settings`

ユーザー共通の通知設定を持つテーブルです。

主なカラム:

- `user_id`
- `notify_enabled`
- `contact_notify_before_days`
- `clinic_notify_before_days`
- `timezone`

意味:

- 通知するかどうか
- 何日前に通知するか
- 将来的なタイムゾーン対応のための情報

## 7. 動作フロー

### 7.1 ログイン後の通常フロー

1. ユーザーがログインする
2. `proxy.ts` と Supabase セッション処理で認証状態を維持する
3. `app/(private)/layout.tsx` で `OneSignalIdentify` を読み込む
4. `OneSignalIdentify` が OneSignal SDK を初期化する
5. Supabase の `user.id` を OneSignal 側にログイン ID として渡す
6. 通知許可が未取得ならブラウザ権限ダイアログを出す
7. ホーム画面で `events` の最新情報を表示する

### 7.2 イベント記録フロー

1. ユーザーが「交換した」または「受診した」ボタンを押す
2. 対応する Server Action が実行される
3. `event_settings` から現在の周期日数を取得する
4. 当日を `occurred_at` として保存する
5. `occurred_at + cycle_days` を `next_due_at` として保存する
6. `/` を再検証して最新表示へ更新する

### 7.3 通知フロー

1. Vercel Cron が `/api/cron/check-notification` を毎日実行する
2. `CRON_SECRET` でアクセスを認証する
3. `notify_enabled = true` のユーザー設定を取得する
4. 各ユーザーの最新 `contact` / `clinic` イベントを取得する
5. `next_due_at - notify_before_days` を計算する
6. 計算結果が当日と一致した場合、OneSignal REST API で Push 送信する

## 8. 認証とセッション管理

### `proxy.ts`

このアプリでは `proxy.ts` から `updateSession()` を呼び出し、Supabase の Cookie ベースセッションを更新しています。

役割:

- リクエスト Cookie から Supabase セッションを復元
- 必要に応じて Cookie を更新
- 未認証なら `/login` にリダイレクト

除外対象:

- `api/cron/*`
- `_next/static`
- `_next/image`
- `favicon.ico`
- 各種画像ファイル

注意:

- Cron API は独自の Bearer Token 認証を使うため、ミドルウェア対象から外されています。

## 9. OneSignal 連携の実装ポイント

### クライアント側

`components/OneSignalIdentify.tsx` が担当しています。

主な役割:

- OneSignal SDK 初期化
- Service Worker の設定
- `user.id` を OneSignal にログイン
- 通知許可ダイアログ表示
- 許可時に `notify_enabled` を `true` に同期

利用している静的ファイル:

- `public/OneSignalSDKWorker.js`

### サーバー側

通知送信は以下 2 系統あります。

- 日次の自動送信: `app/api/cron/check-notification/route.ts`
- 任意送信用 API: `app/api/send-notification/route.ts`

送信先の指定方法:

- `include_aliases.external_id` に Supabase の `user.id` を渡しています。

## 10. Server Actions / API 一覧

### 認証

- `login(formData)`
- `signup(formData)`
- `logout()`

### イベント

- `getNewEvents(userId)`
- `insertContactEvents()`
- `insertEyecareEvent()`

### 設定更新

- `updateContactSettings({ user, contactCycle })`
- `updateClinicSettings({ user, clinicCycle })`
- `updateNotifySettings({ user, notifyEnabled })`

### API

- `GET /api/cron/check-notification`
- `POST /api/send-notification`

## 11. 環境変数

このアプリは次の環境変数を前提にしています。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
CRON_SECRET=
```

用途:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: クライアント用公開キー
- `SUPABASE_SERVICE_ROLE_KEY`: Cron/API 用の管理権限キー
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`: OneSignal アプリ ID
- `ONESIGNAL_REST_API_KEY`: 通知送信用 REST API キー
- `CRON_SECRET`: Cron API 保護用シークレット

注意:

- 秘密情報は Git 管理しない運用が前提です。
- `SUPABASE_SERVICE_ROLE_KEY` と `ONESIGNAL_REST_API_KEY` は特に秘匿すべき値です。

## 12. ローカル開発手順

### 前提

- Node.js 20 系以上推奨
- `pnpm` 推奨

### インストール

```bash
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

起動後:

- `http://localhost:3000` にアクセス

## 13. デプロイ前提

このリポジトリは Vercel を前提にした構成です。

### `vercel.json`

現在は次の Cron が設定されています。

```json
{
  "crons": [
    {
      "path": "/api/cron/check-notification",
      "schedule": "0 4 * * *"
    }
  ]
}
```

意味:

- 毎日 1 回、通知チェック API を実行する設定です。
- Vercel Cron は UTC 基準で扱うため、`0 4 * * *` は日本時間 13:00 の実行を意味します。

## 14. 現在の実装上の注意点

この README は現状実装を説明するものであり、以下は理解しておくべき重要な注意点です。

### 1. サインアップ後の初期設定レコード作成処理は、このリポジトリ内では確認できない

`signup()` は Supabase Auth のユーザー作成のみを行っています。  
一方でアプリ本体は、ログイン後に以下レコードが存在する前提で動作します。

- `user_settings`
- `event_settings` の `contact`
- `event_settings` の `clinic`

そのため、実運用では次のいずれかが必要です。

- Supabase 側の Trigger / Function で自動作成
- 管理画面や別バッチで初期レコードを作成

この SQL 定義やマイグレーションは本リポジトリには含まれていません。

### 2. 通知前日数の UI はあるが、現状コードでは永続化処理が未実装

`components/user-settings.tsx` では以下の入力欄が表示されています。

- `contactNotifyBeforeDays`
- `clinicNotifyBeforeDays`

しかし現在のコード上は、入力値をローカル state に反映しているだけで、DB に保存する Server Action は存在しません。  
そのため、通知前日数は UI 上で変更できても永続化されません。

### 3. `timezone` カラムは存在するが通知判定には未使用

`user_settings.timezone` は型定義に存在しますが、通知判定ロジックでは参照されていません。  
現在の `/api/cron/check-notification` は `lib/date.ts` の `getTodayJstDateString()` を使って日本時間の暦日で日付比較しています。  
ただしユーザーごとのタイムゾーン切り替えには対応しておらず、全ユーザー共通で日本時間基準です。

### 4. 画面文言やメタデータに暫定値が残っている

`app/layout.tsx` の `metadata` はまだ create-next-app の初期値です。

- `title: "Create Next App"`
- `description: "Generated by create next app"`

README を整備しても、アプリ名や説明文を本番向けにするには別途修正が必要です。

## 15. ファイル別の責務整理

### App Router

- `app/layout.tsx`: ルートレイアウトと Toaster
- `app/error.tsx`: グローバルエラー UI
- `app/(private)/layout.tsx`: 認証後共通レイアウト、ヘッダー、OneSignal 初期化
- `app/(private)/page.tsx`: ホーム画面

### 認証

- `app/(auth)/login/page.tsx`: ログイン画面
- `app/(auth)/login/action.ts`: ログイン処理
- `app/(auth)/signup/page.tsx`: サインアップ画面
- `app/(auth)/signup/action.ts`: サインアップ処理

### イベント関連

- `app/(private)/action/get-new-event.ts`: 最新イベント取得
- `app/(private)/action/insert-contact-event.ts`: コンタクト交換記録
- `app/(private)/action/insert-eyecare-event.ts`: 眼科受診記録

### 設定関連

- `app/(private)/action/update-contact-settings.ts`: コンタクト周期更新
- `app/(private)/action/update-clinic-settings.ts`: 眼科周期更新
- `app/(private)/action/update-notify-settings.ts`: 通知 ON / OFF 更新

### 通知関連

- `components/OneSignalIdentify.tsx`: OneSignal 初期化とユーザー紐付け
- `app/api/cron/check-notification/route.ts`: 日次通知判定と送信
- `app/api/send-notification/route.ts`: 任意送信 API
- `public/OneSignalSDKWorker.js`: OneSignal Service Worker

### Supabase

- `utils/supabase/server.ts`: サーバー用クライアント
- `utils/supabase/client.ts`: ブラウザ用クライアント
- `utils/supabase/admin.ts`: Service Role 用クライアント
- `utils/supabase/middleware.ts`: セッション更新ロジック
- `database.types.ts`: Supabase 型定義

## 16. このアプリを一言で言うと

Eye Check は、  
「コンタクト交換」と「眼科受診」をユーザー単位で履歴管理し、次回予定日を自動計算し、OneSignal による Web Push でリマインドする Next.js + Supabase アプリです。
