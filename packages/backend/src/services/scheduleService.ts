import { RateEntry, rateOnDate, rateChangesInPeriod } from './rateService';
import { addOneDay, days30360, lastDayOfMonth, firstDayOfNextMonth } from '../utils/dateUtils';

export interface ScheduleRow {
  paymentDate: string;
  paymentType: 'INTEREST' | 'MATURITY';
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
}

/**
 * Calculates the interest accrued in a period [periodStart, periodEnd] (both inclusive),
 * accounting for mid-period rate changes using the 30/360 US day count convention:
 *
 *   sub-interval interest = principal × (rate / 360) × days30360(subStart, nextBoundary)
 *
 * A complete calendar month with no rate changes always contributes exactly 30 days,
 * so interest = principal × rate / 12 regardless of the actual number of calendar days.
 * Rate changes split the period into sub-intervals, each using its own rate.
 */
function calcPeriodInterest(
  principal: number,
  periodStart: string,
  periodEnd: string,
  rateHistory: RateEntry[]
): number {
  // Rate change dates that fall strictly within the period (> periodStart, <= periodEnd)
  // Each change date is the first day the new rate is in effect.
  const changes = rateChangesInPeriod(rateHistory, periodStart, periodEnd);
  const changeDates = changes.map((c) => c.date);

  // Sub-interval boundaries (exclusive ends): [periodStart, ...changeDates, addOneDay(periodEnd)]
  // Each pair (boundaries[i], boundaries[i+1]) defines a half-open sub-interval.
  const boundaries = [periodStart, ...changeDates, addOneDay(periodEnd)];

  let totalInterest = 0;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const subStart = boundaries[i];
    const nextBoundary = boundaries[i + 1]; // exclusive end of this sub-interval

    const rate = rateOnDate(rateHistory, subStart);
    const days = days30360(subStart, nextBoundary);
    totalInterest += principal * (rate / 360) * days;
  }

  // Round to 2 decimal places
  return Math.round(totalInterest * 100) / 100;
}

/**
 * Generates the full repayment schedule for a bullet loan.
 *
 * Payment dates:
 *   - Last day of each calendar month strictly before endDate
 *   - endDate itself (the maturity payment)
 *
 * All intermediate payments are interest-only.
 * The maturity payment includes the full principal + final period's interest.
 */
export function generateSchedule(
  principal: number,
  startDate: string,
  endDate: string,
  rateHistory: RateEntry[]
): ScheduleRow[] {
  // Step 1: Build payment date list
  const paymentDates: string[] = [];
  let cursor = startDate;

  while (true) {
    const eom = lastDayOfMonth(cursor);
    if (eom >= endDate) break;
    paymentDates.push(eom);
    cursor = firstDayOfNextMonth(cursor);
  }
  paymentDates.push(endDate); // Maturity

  // Step 2: Build schedule rows
  const rows: ScheduleRow[] = [];
  let periodStart = startDate;

  for (let i = 0; i < paymentDates.length; i++) {
    const paymentDate = paymentDates[i];
    const isMaturity = i === paymentDates.length - 1;

    const interest = calcPeriodInterest(principal, periodStart, paymentDate, rateHistory);
    const principalComponent = isMaturity ? principal : 0;
    const total = principalComponent + interest;
    const remainingBalance = isMaturity ? 0 : principal;

    rows.push({
      paymentDate,
      paymentType: isMaturity ? 'MATURITY' : 'INTEREST',
      principal: principalComponent,
      interest,
      total,
      remainingBalance,
    });

    // Next period starts the day after this payment date
    periodStart = addOneDay(paymentDate);
  }

  return rows;
}
