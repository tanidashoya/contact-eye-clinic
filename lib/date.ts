const JST_TIME_ZONE = "Asia/Tokyo";

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

export function getTodayJstDateString(now = new Date()) {
  const { year, month, day } = getDatePartsInJst(now);
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateString: string, days: number) {
  const baseDate = new Date(`${dateString}T00:00:00Z`);

  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  baseDate.setUTCDate(baseDate.getUTCDate() + days);
  return baseDate.toISOString().slice(0, 10);
}
