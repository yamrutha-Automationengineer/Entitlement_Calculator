import { test as base } from 'playwright-bdd';

/**
 * Per-scenario state shared between steps. Each scenario gets its own copy,
 * so parallel scenarios never share it.
 */
export type World = {
  testId?: string;
  pattern?: string;
  timeframe?: string;
  /** Numbers the scenario entered. The expected result is worked out from these. */
  payPeriodHours?: number;
  daysPerWeek?: number;
  weeklyHours?: number;
  shiftsInCycle?: number;
  daysInCycle?: number;
  leaveYearStart?: Date;
  startDate?: Date;
  endDate?: Date;
};

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => {
    await use({});
  },
});
