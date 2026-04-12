"use client";

import { useState, useEffect } from "react";
import { Share, Plus, X } from "lucide-react";
import { Button } from "./ui/button";

export default function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // iOS判定: iPhone/iPad/iPod かつ standalone モードでない
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    const isStandalone =
      ("standalone" in navigator &&
        (navigator as { standalone?: boolean }).standalone === true) ||
      window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("ios-install-prompt-dismissed");

    if (isIos && !isStandalone && !dismissed) {
      setTimeout(() => {
        setShow(true);
      }, 100);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ios-install-prompt-dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">アプリをインストール</h2>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          通知を受け取るには、ホーム画面に追加してください。
        </p>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Share size={16} className="text-blue-600" />
            </div>
            <p className="text-sm">
              画面下の<span className="font-semibold">共有ボタン</span>をタップ
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Plus size={16} className="text-green-600" />
            </div>
            <p className="text-sm">
              <span className="font-semibold">ホーム画面に追加</span>を選択
            </p>
          </div>
        </div>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="w-full rounded-xl"
        >
          閉じる
        </Button>
      </div>
    </div>
  );
}
