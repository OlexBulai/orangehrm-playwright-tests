import { expect, Page } from '@playwright/test';

export default class PerformancePage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', {
      name: 'Employee Reviews',
      exact: true,
    });
  }

  get employeeNameInput() {
    return this.page.getByPlaceholder('Type for hints...');
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  get reviewStatusSelect() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Review Status' })
      .locator('.oxd-select-text');
  }

  async selectReviewStatus(status: string) {
    await this.reviewStatusSelect.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
  }

  async open() {
    await this.page
      .getByRole('link', { name: 'Performance', exact: true })
      .click();
    await expect(this.page).toHaveURL(
      /performance\/searchEvaluatePerformanceReview/,
    );
    await expect(this.heading).toBeVisible();
  }
}
