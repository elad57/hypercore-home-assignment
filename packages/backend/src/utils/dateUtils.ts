/**
 * All date functions operate on ISO date strings "YYYY-MM-DD".
 * Using string arithmetic avoids timezone drift issues with JS Date objects.
 */

export function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Returns the last calendar day of the month containing the given date. */
export function lastDayOfMonth(date: string): string {
  const { year, month } = parseDate(date);
  // Day 0 of next month = last day of current month
  const last = new Date(Date.UTC(year, month, 0));
  return formatDate(last.getUTCFullYear(), last.getUTCMonth() + 1, last.getUTCDate());
}

/** Returns the first day of the next calendar month. */
export function firstDayOfNextMonth(date: string): string {
  const { year, month } = parseDate(date);
  if (month === 12) {
    return formatDate(year + 1, 1, 1);
  }
  return formatDate(year, month + 1, 1);
}

/** Adds one calendar day to a date string. */
export function addOneDay(date: string): string {
  const { year, month, day } = parseDate(date);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  return formatDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}


/**
 * Returns the 30/360 US day count from startDate (inclusive) to endExclusive (exclusive).
 *
 * Formula: 360*(Y2-Y1) + 30*(M2-M1) + D2 - D1
 * Adjustments (30/360 US / NASD convention):
 *   - If D1 = 31, set D1 = 30
 *   - If D2 = 31 and D1 >= 30, set D2 = 30
 *
 * A complete calendar month always yields 30, so a full constant-rate month
 * produces principal × (rate/360) × 30 = principal × rate/12.
 */
export function days30360(startDate: string, endExclusive: string): number {
  const { year: y1, month: m1, day: d1Raw } = parseDate(startDate);
  const { year: y2, month: m2, day: d2Raw } = parseDate(endExclusive);

  const d1 = d1Raw === 31 ? 30 : d1Raw;
  const d2 = d2Raw === 31 && d1Raw >= 30 ? 30 : d2Raw;

  return 360 * (y2 - y1) + 30 * (m2 - m1) + d2 - d1;
}
