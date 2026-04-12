//OneSignalのService Workerファイル
// OneSignal の CDN 上の本番用ワーカーを読み込むだけのラッパー」 。通知の受信・表示などの本質的な処理は、importScripts で読み込んだ OneSignalSDK.sw.js 側
//つまり OneSignal が CDN 上で配っている公式の Service Worker 用スクリプトを読み込んでいる
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
