import { mkdir, writeFile } from 'node:fs/promises';
import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { test } from './fixtures';
import { StartPage } from '../src/pages/StartPage';
import { IrregularHoursPage, YesNoAnswer } from '../src/pages/IrregularHoursPage';
import { DateInput } from '../src/components/DateInput';
import { FIELD } from '../src/constants/vocabulary';
import { expectedEntitlement, parseUkDate, readShownFigure } from '../src/helpers/entitlement';
import {
  chooseOption,
  continueButton,
  isNotApplicable,
  textbox,
  toDateParts,
} from '../src/helpers/answers';

const { Given, When, Then } = createBdd(test);

// --- Setup ---------------------------------------------------------------------

Given('I am on the GOV.UK Holiday Entitlement Calculator start page', async ({ page }) => {
  await new StartPage(page).goto();
});

When('I click start now', async ({ page }) => {
  await new StartPage(page).startCalculator();
});

Given('I am testing case {string}', async ({ world }, testId: string) => {
  world.testId = testId;
});

// --- Irregular hours -----------------------------------------------------------

Given('I answer the irregular hours question with {string}', async ({ page }, answer: string) => {
  if (answer !== 'Yes' && answer !== 'No') {
    throw new Error(`Irregular hours answer must be "Yes" or "No", got "${answer}"`);
  }
  const question = new IrregularHoursPage(page);
  await question.expectLoaded();
  await question.selectAnswer(answer as YesNoAnswer);
  await question.submit();
});

// --- Helpers -------------------------------------------------------------------

/** Turns a data cell into a number. N/A (or blank) becomes undefined. */
function toNumber(value: string): number | undefined {
  return isNotApplicable(value) || value.trim() === '' ? undefined : Number(value);
}

/**
 * GOV.UK asks one question per screen. Enters the value and continues.
 * N/A means this screen is not shown for the row, so nothing happens.
 */
async function answerScreen(
  page: Page,
  label: string | RegExp,
  field: string,
  value: string,
): Promise<void> {
  if (isNotApplicable(value)) return;
  await textbox(page, label, field).fill(value);
  await continueButton(page).click();
}

// --- Leave year and pay period -------------------------------------------------

When('I enter the leave year start date {string}', async ({ page, world }, date: string) => {
  if (isNotApplicable(date)) return;
  world.leaveYearStart = parseUkDate(date);
  await new DateInput(page).fill(...toDateParts(date));
  await continueButton(page).click();
});

When('I enter the pay period hours {string}', async ({ page, world }, hours: string) => {
  world.payPeriodHours = toNumber(hours);
  await answerScreen(page, FIELD.payPeriodHours, 'pay period hours', hours);
});

When('I enter the number of days worked per week {string}', async ({ page }, days: string) => {
  await answerScreen(page, FIELD.daysWorked, 'days worked per week', days);
});

// --- Working pattern and timeframe ---------------------------------------------

When('I select working pattern {string}', async ({ page, world }, pattern: string) => {
  world.pattern = pattern;
  await chooseOption(page, pattern);
});

When('I select leave timeframe {string}', async ({ page, world }, timeframe: string) => {
  world.timeframe = timeframe;
  await chooseOption(page, timeframe);
});

When(
  'I enter the start date {string} and the end date {string}',
  async ({ page, world }, start: string, end: string) => {
    // Each date is its own screen. A value of N/A means that screen is not shown.
    if (!isNotApplicable(start)) {
      world.startDate = parseUkDate(start);
      await new DateInput(page).fill(...toDateParts(start));
      await continueButton(page).click();
    }
    if (!isNotApplicable(end)) {
      world.endDate = parseUkDate(end);
      await new DateInput(page).fill(...toDateParts(end));
      await continueButton(page).click();
    }
  },
);

When(
  'I enter working pattern details with days {string}, amount {string}, shift duration {string}, shifts in cycle {string}, days in cycle {string}',
  async (
    { page, world },
    days: string,
    amount: string,
    shiftDuration: string,
    shiftsInCycle: string,
    daysInCycle: string,
  ) => {
    // Only the fields the selected pattern asks for are used. The others are N/A in the data.
    // Each number entered is also kept in the world, so the expected result can be worked out.
    switch (world.pattern) {
      case 'days worked per week':
        world.daysPerWeek = toNumber(days);
        await answerScreen(page, FIELD.daysWorked, 'days worked per week', days);
        break;
      case 'hours worked per week':
        world.weeklyHours = toNumber(amount);
        world.daysPerWeek = toNumber(days);
        await answerScreen(page, FIELD.weeklyHours, 'weekly hours', amount);
        await answerScreen(page, FIELD.daysWorked, 'days worked per week', days);
        break;
      case 'annualised hours':
        // For a full leave year, the result appears straight after the timeframe, so there is
        // no amount to enter. Part-year annualised hours have not been tested yet.
        break;
      case 'compressed hours':
        // The calculator asks weekly hours, then days worked per week, before the result.
        world.weeklyHours = toNumber(amount);
        world.daysPerWeek = toNumber(days);
        await answerScreen(page, FIELD.weeklyHours, 'weekly hours', amount);
        await answerScreen(page, FIELD.daysWorked, 'days worked per week', days);
        break;
      case 'shifts':
        world.shiftsInCycle = toNumber(shiftsInCycle);
        world.daysInCycle = toNumber(daysInCycle);
        await answerScreen(page, FIELD.shiftDuration, 'shift duration', shiftDuration);
        await answerScreen(page, FIELD.shiftsInCycle, 'shifts in cycle', shiftsInCycle);
        await answerScreen(page, FIELD.daysInCycle, 'days in cycle', daysInCycle);
        break;
      default:
        throw new Error(`No working pattern was selected before the details step (pattern: "${world.pattern}").`);
    }
  },
);

// --- Outcome -------------------------------------------------------------------

Then('the answers entered should be shown', async ({ page, world }) => {
  const main = page.getByRole('main');
  if (world.pattern) await expect(main).toContainText(world.pattern);
  if (world.timeframe) await expect(main).toContainText(world.timeframe);
});

Then('the expected result is calculated from the answers', async ({ page, world }) => {
  const main = page.getByRole('main');
  const expected = expectedEntitlement(world);

  if (expected === null) {
    // No rule covers these answers yet (see src/helpers/entitlement.ts). Still check that a
    // result page appeared, so an unfinished journey fails instead of passing silently.
    // Set CAPTURE_RESULTS=1 to save the page text, so a new rule can be checked against it.
    if (process.env.CAPTURE_RESULTS) {
      await mkdir('captured-results', { recursive: true });
      await writeFile(`captured-results/${world.testId ?? 'unknown'}.txt`, await main.innerText());
    }
    test.info().annotations.push({
      type: 'expected-result-not-calculated',
      description: world.testId ?? 'unknown case',
    });
    await expect(main).toContainText('statutory');
    return;
  }

  // Read the figure from the result sentence, for example "is 28 days" or "is 5 hours",
  // and check it is within the tolerance for this rule.
  const shown = readShownFigure(await main.innerText());
  expect(shown, 'the result sentence was not found on the page').not.toBeNull();
  expect(shown!.unit, 'the unit shown on the page').toBe(expected.unit);
  expect(
    Math.abs(shown!.value - expected.value),
    `shown ${shown!.value} ${shown!.unit}, expected about ${expected.value.toFixed(2)} ${expected.unit}`,
  ).toBeLessThanOrEqual(expected.tolerance);
});
