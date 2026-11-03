import { Page, Locator } from '@playwright/test';

/**
 * The Day / Month / Year fields GOV.UK uses for a date question.
 * One date per screen, so the labels are unique on the page.
 */
export class DateInput {
  private readonly day: Locator;
  private readonly month: Locator;
  private readonly year: Locator;

  constructor(page: Page) {
    this.day = page.getByRole('textbox', { name: 'Day' });
    this.month = page.getByRole('textbox', { name: 'Month' });
    this.year = page.getByRole('textbox', { name: 'Year' });
  }

  async fill(day: string, month: string, year: string): Promise<void> {
    await this.day.fill(day);
    await this.month.fill(month);
    await this.year.fill(year);
  }
}
