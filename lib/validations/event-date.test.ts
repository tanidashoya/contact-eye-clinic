import { describe, expect, it } from "vitest";
import { updateEventDateSchema } from "@/lib/validations/event-date";

describe("updateEventDateSchema", () => {
  it("正しい更新 payload なら成功する", () => {
    const result = updateEventDateSchema.safeParse({
      eventId: 1,
      eventType: "contact",
      field: "occurred_at",
      value: "2026-04-15",
    });

    expect(result.success).toBe(true);
  });

  it("日付文字列を trim する", () => {
    const result = updateEventDateSchema.safeParse({
      eventId: 1,
      eventType: "clinic",
      field: "next_due_at",
      value: " 2026-05-01 ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe("2026-05-01");
    }
  });

  it("存在しない日付なら失敗する", () => {
    const result = updateEventDateSchema.safeParse({
      eventId: 1,
      eventType: "contact",
      field: "next_due_at",
      value: "2026-02-30",
    });

    expect(result.success).toBe(false);
  });

  it("空文字なら null に正規化する", () => {
    const result = updateEventDateSchema.safeParse({
      eventId: 1,
      eventType: "contact",
      field: "next_due_at",
      value: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBeNull();
    }
  });

  it("余計なキーがある payload は失敗する", () => {
    const result = updateEventDateSchema.safeParse({
      eventId: 1,
      eventType: "contact",
      field: "next_due_at",
      value: "2026-04-15",
      userId: "other-user",
    });

    expect(result.success).toBe(false);
  });
});
