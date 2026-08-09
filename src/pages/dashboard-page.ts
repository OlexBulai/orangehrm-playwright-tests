import { expect, Page } from '@playwright/test';

export default class DashboardPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Dashboard', exact: true });
  }

  get widgets() {
    return this.page.locator('.orangehrm-dashboard-widget');
  }

  get quickLaunchCards() {
    return this.page.locator('.orangehrm-quick-launch-card');
  }

  async open() {
    await this.page
      .getByRole('link', { name: 'Dashboard', exact: true })
      .click();
    await expect(this.page).toHaveURL(/dashboard\/index/);
    await expect(this.heading).toBeVisible();
  }
}
