import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  getTodayJstDateString,
  isValidDateString,
} from "@/lib/date";

describe("getTodayJstDateString", () => {
  it("UTCでは前日でもJSTの当日を返す", () => {
    expect(getTodayJstDateString(new Date("2026-04-14T15:00:00.000Z"))).toBe(
      "2026-04-15",
    );
  });
});

describe("addDaysToDateString", () => {
  it("JSTの暦日として日数を加算する", () => {
    expect(addDaysToDateString("2026-04-15", 14)).toBe("2026-04-29");
  });

  it("JSTの暦日として年をまたいで加算する", () => {
    expect(addDaysToDateString("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("JSTの暦日として月をまたいで減算する", () => {
    expect(addDaysToDateString("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("存在しない日付なら例外を投げる", () => {
    expect(() => addDaysToDateString("2026-02-30", 1)).toThrow(
      "Invalid date string",
    );
  });
});

describe("isValidDateString", () => {
  it("実在する日付だけを許可する", () => {
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2026-02-30")).toBe(false);
  });
});
