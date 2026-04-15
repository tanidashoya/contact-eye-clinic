import { z } from "zod";
import { isValidDateString } from "@/lib/date";

function normalizeTrimmedString(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return value;
}

const dateFieldSchema = z.preprocess(
  (value) => {
    const normalized = normalizeTrimmedString(value);
    return normalized === "" ? null : normalized;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません")
    .refine(isValidDateString, "存在しない日付です")
    .nullable(),
);

export const updateEventDateSchema = z.strictObject({
  eventId: z.coerce
    .number("更新対象の記録が見つかりません")
    .int("更新対象の記録が見つかりません")
    .positive("更新対象の記録が見つかりません"),
  eventType: z.enum(["contact", "clinic"]),
  field: z.enum(["occurred_at", "next_due_at"]),
  value: dateFieldSchema,
});

export type UpdateEventDateInput = z.infer<typeof updateEventDateSchema>;
