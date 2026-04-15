const JST_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_STRING_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

//入ってきた瞬間（Dateオブジェクト）をJSTの年月日に変換する
//Intl.DateTimeFormat … 日付・時刻を「その地域の書き方」で表示
//.formatToParts(date) … [{ type: "year", value: "2026" }, { type: "month", value: "04" }, ...] のような「部品の配列」 にする
function getDatePartsInJst(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format JST date parts.");
  }

  return { year, month, day };
}

function parseDateStringParts(dateString: string) {
  const match = DATE_STRING_PATTERN.exec(dateString);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return { year, month, day };
}

export function isValidDateString(dateString: string) {
  const parts = parseDateStringParts(dateString);

  if (!parts) return false;

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  return (
    utcDate.getUTCFullYear() === parts.year &&
    utcDate.getUTCMonth() === parts.month - 1 &&
    utcDate.getUTCDate() === parts.day
  );
}

export function getTodayJstDateString(now = new Date()) {
  const { year, month, day } = getDatePartsInJst(now);
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateString: string, days: number) {
  const parts = parseDateStringParts(dateString);

  if (!parts || !isValidDateString(dateString) || !Number.isFinite(days)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  const jstMidnightTime =
    Date.UTC(parts.year, parts.month - 1, parts.day) - JST_OFFSET_MS;
  const nextDate = new Date(jstMidnightTime + days * DAY_MS);
  const nextParts = getDatePartsInJst(nextDate);

  return `${nextParts.year}-${nextParts.month}-${nextParts.day}`;
}
