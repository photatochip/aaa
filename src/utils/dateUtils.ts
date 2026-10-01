export interface WeekInfo {
  monday: Date;
  friday: Date;
  thursday: Date;
  mondayKey: string; // YYYY-MM-DD
  year: number;
  month: number;
  weekNum: number;
  weekName: string; // e.g. "2026년 10월 2주차"
  periodStr: string; // e.g. "10. 5.(월) ~ 10. 9.(금)"
  prevPeriodStr: string; // e.g. "9. 28.(월) ~ 10. 2.(금)"
  fullTitle: string; // e.g. "2026년 10월 2주차 (10. 5.(월) ~ 10. 9.(금))"
}

const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Format a Date object to YYYY-MM-DD
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD to Date (at local midnight)
 */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Given any date, calculate the Monday of that week.
 * (Week runs Monday to Sunday).
 */
export function getMondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Rule:
 * "앱을 목~일요일에 열면 다음 주, 월~수요일에 열면 이번 주를 기본으로 보여준다."
 * Returns the target Monday based on current date.
 */
export function getDefaultTargetMonday(baseDate: Date = new Date()): Date {
  const day = baseDate.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const isNextWeek = day === 0 || day === 4 || day === 5 || day === 6;

  const currentMonday = getMondayOf(baseDate);
  if (isNextWeek) {
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    return nextMonday;
  }
  return currentMonday;
}

/**
 * Calculate week information for a given Monday according to the prompt's rules:
 * - 주차 이름은 '그 주 목요일이 속한 달' 기준으로 정한다.
 * - 예) 2026.10.5.(월)~10.9.(금) → "2026년 10월 2주차"
 */
export function getWeekInfo(monday: Date): WeekInfo {
  const mon = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
  const fri = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 4);
  const thu = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 3);

  // Month and Year of the Thursday of this week
  const targetYear = thu.getFullYear();
  const targetMonth = thu.getMonth() + 1; // 1-12

  // Find the first Thursday of targetMonth
  const firstOfMonth = new Date(targetYear, thu.getMonth(), 1);
  const firstDow = firstOfMonth.getDay(); // 0: Sun, 1: Mon, ..., 4: Thu, 5: Fri, 6: Sat
  const daysToFirstThu = firstDow <= 4 ? 4 - firstDow : 4 - firstDow + 7;
  const firstThuDate = 1 + daysToFirstThu;

  // Week number in this month
  const weekNum = Math.floor((thu.getDate() - firstThuDate) / 7) + 1;

  // Format: "10. 5.(월) ~ 10. 9.(금)"
  const periodStr = `${mon.getMonth() + 1}. ${mon.getDate()}.(월) ~ ${fri.getMonth() + 1}. ${fri.getDate()}.(금)`;

  // Previous week period
  const prevMon = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 7);
  const prevFri = new Date(fri.getFullYear(), fri.getMonth(), fri.getDate() - 7);
  const prevPeriodStr = `${prevMon.getMonth() + 1}. ${prevMon.getDate()}.(월) ~ ${prevFri.getMonth() + 1}. ${prevFri.getDate()}.(금)`;

  const weekName = `${targetYear}년 ${targetMonth}월 ${weekNum}주차`;
  const fullTitle = `${weekName} (${periodStr})`;

  return {
    monday: mon,
    friday: fri,
    thursday: thu,
    mondayKey: toDateKey(mon),
    year: targetYear,
    month: targetMonth,
    weekNum,
    weekName,
    periodStr,
    prevPeriodStr,
    fullTitle,
  };
}
