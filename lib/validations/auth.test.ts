// zod のバリデーションが期待どおり動くかの単体テスト
import { describe, expect, it } from "vitest";
import { loginFormSchema, signupFormSchema } from "@/lib/validations/auth";

//loginFormSchemaをその場で実行して、返ってきた結果を検証している
//descrive:テストケースのグループを定義する（第一引数:テストケースのグループの名前、第二引数:テストケースのグループの内容）
//it:テストケースを定義する（第一引数:テストケースの名前、第二引数:テストケースの内容）ここでloginFormSchemaを実行している
//expect:テスト結果を検証する
//toBe:テスト結果が期待値と一致するかを検証する
describe("loginFormSchema", () => {
  it("メールとパスワードが正しければ成功する", () => {
    const result = loginFormSchema.safeParse({
      email: "test@example.com",
      password: "secret12",
    });
    expect(result.success).toBe(true);
  });

  it("メールが空なら失敗する", () => {
    const result = loginFormSchema.safeParse({
      email: "",
      password: "secret12",
    });
    expect(result.success).toBe(false);
  });

  it("メールが空のとき、最初のエラーメッセージが想定どおり", () => {
    const result = loginFormSchema.safeParse({
      email: "",
      password: "secret12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "メールアドレスを入力してください",
      );
    }
  });

  it("メール形式が不正なとき、形式エラーになる", () => {
    const result = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "secret12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("メールアドレスの形式が正しくありません");
    }
  });

  it("パスワードが5文字以下なら失敗する", () => {
    const result = loginFormSchema.safeParse({
      email: "a@b.co",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupFormSchema", () => {
  it("名前・メール・パスワードが正しければ成功する", () => {
    const result = signupFormSchema.safeParse({
      name: "太郎",
      email: "Test@EXAMPLE.com",
      password: "secret12",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
      expect(result.data.name).toBe("太郎");
    }
  });

  it("名前が空なら失敗する", () => {
    const result = signupFormSchema.safeParse({
      name: "   ",
      email: "t@example.com",
      password: "secret12",
    });
    expect(result.success).toBe(false);
  });

  it("名前が51文字なら失敗する", () => {
    const result = signupFormSchema.safeParse({
      name: "a".repeat(51),
      email: "t@example.com",
      password: "secret12",
    });
    expect(result.success).toBe(false);
  });
});
