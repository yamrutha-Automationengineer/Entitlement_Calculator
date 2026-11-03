import { Locator, Page } from '@playwright/test';

/** The feature uses N/A where a value does not apply to that row. */
export const NOT_APPLICABLE = 'N/A';

export const isNotApplicable = (value: string): boolean => value === NOT_APPLICABLE;

/** The Continue button present on every question screen. */
export const continueButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Continue' });

/** Ticks a radio option by its label, then continues. */
export async function chooseOption(page: Page, label: string): Promise<void> {
  await page.getByRole('radio', { name: label }).check();
  await continueButton(page).click();
}

/**
 * Returns a textbox locator. Fails straight away when the label has not been
 * confirmed yet, instead of waiting for the test timeout.
 */
export function textbox(page: Page, label: string | RegExp, field: string): Locator {
  if (label === 'TODO') {
    throw new Error(`The label for "${field}" is not confirmed. Set it in src/constants/vocabulary.ts.`);
  }
  return page.getByRole('textbox', { name: label });
}

/** Splits a dd/mm/yyyy date, the format used by the decision table and the form. */
export function toDateParts(value: string): [string, string, string] {
  const [day, month, year] = value.split('/');
  return [day, month, year];
}
