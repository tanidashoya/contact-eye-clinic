import { z } from "zod";

const cycleDaysSchema = z.coerce
  .number("日数を入力してください")
  .int("日数は整数で入力してください")
  .min(1, "日数は1日以上で入力してください")
  .max(365, "日数は365日以内で入力してください");

const notifyBeforeDaysSchema = z.coerce
  .number("通知日は数値で入力してください")
  .int("通知日は整数で入力してください")
  .min(0, "通知日は0日以上で入力してください")
  .max(365, "通知日は365日以内で入力してください");

export const updateContactSettingsSchema = z.strictObject({
  contactCycle: cycleDaysSchema,
});

export const updateClinicSettingsSchema = z.strictObject({
  clinicCycle: cycleDaysSchema,
});

export const updateNotifySettingsSchema = z.strictObject({
  notifyEnabled: z.boolean(),
});

export const updateNotifyBeforeDaysSchema = z.strictObject({
  contactNotifyBeforeDays: notifyBeforeDaysSchema,
  clinicNotifyBeforeDays: notifyBeforeDaysSchema,
});
