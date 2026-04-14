//vitestの設定ファイル
import path from "node:path";
import { defineConfig } from "vitest/config";

//difineconfig:vitestの設定を定義する関数
//内部のオブジェクトは実際の設定内容
//resolve:全体のルールを設定するオブジェクト
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."), //コマンドを実行する場所(プロジェクトのルートディレクトリ)に @ という名前を付けている
    },
  },
  test: {
    environment: "node", //テスト環境をnodeに設定
  },
});
