/**
 * Works out the expected result for each scenario from the answers it entered.
 * Nothing is typed in as an expected value.
 *
 * Full year:
 * - Days: days worked per week x 5.6, up to a maximum of 28.
 * - Hours, and compressed hours: weekly hours x 5.6.
 * - Annualised hours: 5.6 weeks.
 * - Shifts: (shifts in cycle / days in cycle) x 7 x 5.6.
 *
 * Part year:
 * - Leaving part way through: the full-year figure, multiplied by the share of the
 *   leave year worked. The share is counted in calendar days, with the end date included.
 * - Starting and leaving, with no leave year start (No branch): days from start to end,
 *   including both dates, out of 365.
 * - Starting part way through: one-twelfth of the full-year figure for each month worked,
 *   counting the start month and using April to March as the year. Days, shifts and hours
 *   are then rounded up to the next half day or half shift. Weeks are not rounded.
 *
 * Irregular hours (pay period): hours worked x 12.07%, rounded, with 0.5 and above
 * rounding up.
 *
 * The 5.6 weeks, the 28-day cap and the monthly pro-rata come from the GOV.UK guidance.
 * The 12.07% rate and the part-year and rounding rules were worked out from the
 * calculator's own results. See the README for the detail.
 */

export const WEEKS_OF_LEAVE = 5.6;
export const MAX_DAYS = 28;
export const IRREGULAR_HOURS_RATE = 0.1207;

const DAY_MS = 86_400_000;

export const FULL_YEAR = 'for a full leave year';
export const STARTING = 'for someone starting part way through a leave year';
export const LEAVING_ONLY = 'for someone leaving part way through a leave year';
export const STARTING_AND_LEAVING = 'for someone starting and leaving part way through a leave year';

export type Answers = {
  timeframe?: string;
  pattern?: string;
  daysPerWeek?: number;
  weeklyHours?: number;
  shiftsInCycle?: number;
  daysInCycle?: number;
  payPeriodHours?: number;
  leaveYearStart?: Date;
  startDate?: Date;
  endDate?: Date;
};

/** The figure the calculator should show, and how close a shown figure must be. */
export type Expected = {
  value: number;
  unit: 'days' | 'hours' | 'weeks' | 'shifts';
  tolerance: number;
};

/** Reads a date written as dd/mm/yyyy. */
export function parseUkDate(text: string): Date {
  const [day, month, year] = text.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Share of the leave year worked, in calendar days. The start is counted from the leave
 * year start; the end date is included. Returns null when the dates are missing.
 */
export function leaveYearShare(answers: Answers): number | null {
  // Starting and leaving with no leave year start (the No branch does not ask for one):
  // count the days from start to end, inclusive, over a 365-day year.
  if (!answers.leaveYearStart && answers.startDate && answers.endDate) {
    const days = (answers.endDate.getTime() - answers.startDate.getTime()) / DAY_MS + 1;
    return days / 365;
  }

  const yearStart = answers.leaveYearStart;
  if (!yearStart) return null;
  const nextYearStart = Date.UTC(yearStart.getUTCFullYear() + 1, yearStart.getUTCMonth(), yearStart.getUTCDate());
  const yearDays = (nextYearStart - yearStart.getTime()) / DAY_MS;

  const from = answers.startDate ? (answers.startDate.getTime() - yearStart.getTime()) / DAY_MS : 0;
  const to = answers.endDate ? (answers.endDate.getTime() - yearStart.getTime()) / DAY_MS + 1 : yearDays;
  return (to - from) / yearDays;
}

/** Full-year entitlement for the pattern, before any part-year share. */
function fullYear(answers: Answers): { value: number; unit: Expected['unit'] } | null {
  switch (answers.pattern) {
    case 'days worked per week':
      if (answers.daysPerWeek === undefined) return null;
      return { value: Math.min(answers.daysPerWeek * WEEKS_OF_LEAVE, MAX_DAYS), unit: 'days' };

    case 'hours worked per week':
    case 'compressed hours': // the calculator works compressed hours out the same way
      if (answers.weeklyHours === undefined) return null;
      return { value: answers.weeklyHours * WEEKS_OF_LEAVE, unit: 'hours' };

    case 'annualised hours':
      return { value: WEEKS_OF_LEAVE, unit: 'weeks' };

    case 'shifts':
      if (answers.shiftsInCycle === undefined || answers.daysInCycle === undefined) return null;
      return { value: (answers.shiftsInCycle / answers.daysInCycle) * 7 * WEEKS_OF_LEAVE, unit: 'shifts' };

    default:
      return null;
  }
}

/**
 * Reads the figure from the calculator's result sentence. Days, hours, weeks and shifts
 * are shown as a decimal ("23.5 days"). Compressed hours are shown as hours and minutes
 * ("176 hours and 18 minutes"), which is converted to decimal hours here.
 */
export function readShownFigure(text: string): { value: number; unit: Expected['unit'] } | null {
  const minutes = /statutory[^\n]*? is (\d+) hours and (\d+) minutes/.exec(text);
  if (minutes) {
    return { value: Number(minutes[1]) + Number(minutes[2]) / 60, unit: 'hours' };
  }
  const decimal = /statutory[^\n]*? is ([\d.]+) (days|hours|weeks|shifts)\b/.exec(text);
  if (decimal) {
    return { value: Number(decimal[1]), unit: decimal[2] as Expected['unit'] };
  }
  return null;
}

/**
 * Returns the figure the calculator should show and how close it must be, or null when
 * no rule covers these answers yet.
 */
export function expectedEntitlement(answers: Answers): Expected | null {
  // Irregular hours accrual, from the pay period hours. The calculator shows whole hours.
  if (answers.payPeriodHours !== undefined) {
    return { value: Math.round(answers.payPeriodHours * IRREGULAR_HOURS_RATE), unit: 'hours', tolerance: 0.01 };
  }

  const entitlement = fullYear(answers);
  if (!entitlement) return null;

  if (answers.timeframe === FULL_YEAR) {
    // Compressed hours are shown to the minute, which is 0.017 of an hour.
    return { ...entitlement, tolerance: 0.02 };
  }

  if (answers.timeframe === LEAVING_ONLY || answers.timeframe === STARTING_AND_LEAVING) {
    const share = leaveYearShare(answers);
    if (share === null) return null;
    // Days and hours are shown to one decimal place, weeks and shifts to two.
    const tolerance = entitlement.unit === 'days' || entitlement.unit === 'hours' ? 0.1 : 0.01;
    return { value: entitlement.value * share, unit: entitlement.unit, tolerance };
  }

  if (answers.timeframe === STARTING) {
    return startingOnly(answers, entitlement);
  }

  return null; // unknown timeframe
}

/**
 * Starting part way through the year: one-twelfth of the leave for each month worked,
 * counted from the start month. Days, shifts and hours are then rounded up to the next
 * half day (or half shift). Weeks are not rounded.
 */
function startingOnly(
  answers: Answers,
  entitlement: { value: number; unit: Expected['unit'] },
): Expected | null {
  if (!answers.startDate) return null;

  // The leave year runs April to March, so April is the first month.
  const monthIndex = (answers.startDate.getUTCMonth() - 3 + 12) % 12;
  const monthsWorked = 12 - monthIndex;
  const value = (entitlement.value * monthsWorked) / 12;
  const halfUp = (x: number) => Math.ceil(x * 2 - 1e-9) / 2;

  switch (entitlement.unit) {
    case 'weeks':
      return { value, unit: 'weeks', tolerance: 0.01 };
    case 'shifts':
    case 'days':
      return { value: halfUp(value), unit: entitlement.unit, tolerance: 0.1 };
    case 'hours': {
      // Hours are rounded up in whole half days of the worker's pattern.
      if (!answers.weeklyHours || !answers.daysPerWeek) return null;
      const hoursPerDay = answers.weeklyHours / answers.daysPerWeek;
      return { value: halfUp(value / hoursPerDay) * hoursPerDay, unit: 'hours', tolerance: 0.1 };
    }
  }
}
