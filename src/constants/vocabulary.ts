/**
 * The question labels the step definitions use to find each field on the calculator.
 *
 * The answer options and timeframe wording are not kept here. They match the
 * decision table, which is the same wording the calculator shows.
 *
 * A TODO value means the label has not been checked on the live page yet. A step
 * that needs it fails straight away with a clear message.
 */
export const FIELD = {
  // Hours worked in the pay period. Used by the accrual scenarios.
  payPeriodHours: /How many hours has the employee worked/,

  // Days worked per week. Used by the days worked and hours worked patterns.
  daysWorked: /Number of days worked per/,

  // Hours worked per week. Compressed hours asks the same question, so it uses this label too.
  weeklyHours: /Number of hours worked per week/,

  // Hours in each shift.
  shiftDuration: /How many hours in each shift/,

  // Shifts in the shift pattern.
  shiftsInCycle: /How many shifts will be worked per shift pattern/,

  // Days in the shift pattern.
  daysInCycle: /How many days in the shift pattern/,
} as const;
