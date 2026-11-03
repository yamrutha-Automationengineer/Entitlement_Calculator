import { Page, Locator, expect } from '@playwright/test';
import { CALCULATOR } from '../constants/calculator';

export type YesNoAnswer = 'Yes' | 'No';

/**
 * Page object for the question:
 * "Does the employee work irregular hours or for part of the year?"
 */
export class IrregularHoursPage {
  readonly page: Page;
  readonly question: Locator;
  readonly yesOption: Locator;
  readonly noOption: Locator;
  readonly continueButton: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.question = page.getByRole('group', {
      name: CALCULATOR.irregularHoursQuestion.question,
    });
    this.yesOption = page.getByLabel(CALCULATOR.irregularHoursQuestion.yes, { exact: true });
    this.noOption = page.getByLabel(CALCULATOR.irregularHoursQuestion.no, { exact: true });
    this.continueButton = page.getByRole('button', {
      name: CALCULATOR.irregularHoursQuestion.continueButton,
    });
    // GOV.UK places validation errors in an error summary at the top of the form.
    this.errorSummary = page.locator('.govuk-error-summary');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.question).toBeVisible();
    await expect(this.yesOption).toBeVisible();
    await expect(this.noOption).toBeVisible();
  }

  async selectAnswer(answer: YesNoAnswer): Promise<void> {
    await (answer === 'Yes' ? this.yesOption : this.noOption).check();
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }
}
