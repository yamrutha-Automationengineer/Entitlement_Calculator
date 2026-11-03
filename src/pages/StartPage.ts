import { Page, Locator, expect } from '@playwright/test';
import { CALCULATOR } from '../constants/calculator';

/**
 * Page object for the 'Calculate holiday entitlement' landing page.
 */
export class StartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly startNowButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      level: 1,
      name: CALCULATOR.startPage.heading,
    });
    // GOV.UK renders "Start now" as a button, not a link.
    this.startNowButton = page.getByRole('button', {
      name: CALCULATOR.startPage.startButtonText,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto(CALCULATOR.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async startCalculator(): Promise<void> {
    await this.startNowButton.click();
  }
}
