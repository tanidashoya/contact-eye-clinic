import { z } from "zod";

function normalizeTrimmedString(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return value;
}

//preprocess:第一引数に関数を渡すと、その関数の戻り値を第二引数のスキーマに適用する
const emailFieldSchema = z.preprocess((value) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim().toLowerCase();
  return value;
}, z.string().min(1, "メールアドレスを入力してください").email("メールアドレスの形式が正しくありません"));

const passwordFieldSchema = z.preprocess(
  (value) => (value == null ? "" : value),
  z
    .string()
    .min(1, "パスワードを入力してください")
    .min(6, "パスワードは6文字以上で入力してください"),
);

const nameFieldSchema = z.preprocess(
  normalizeTrimmedString,
  z
    .string()
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),
);

export const loginFormSchema = z.strictObject({
  email: emailFieldSchema,
  password: passwordFieldSchema,
});

export const signupFormSchema = z.strictObject({
  name: nameFieldSchema,
  email: emailFieldSchema,
  password: passwordFieldSchema,
});

//z.inferはzodスキーマからtypescriptの型を生成する関数
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type SignupFormInput = z.infer<typeof signupFormSchema>;
