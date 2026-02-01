export type MonthKey = string; // "YYYY-MM"

export function toMonthKey(date: Date): MonthKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

export function shiftMonth(
  month: MonthKey,
  delta: number
): MonthKey {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthKey(d);
}
