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

  quickLaunchCard(
    action: 'Leave List' | 'Timesheets' | 'Assign Leave' | 'My Leave',
  ) {
    return this.quickLaunchCards.filter({ hasText: action });
  }

  async open() {
    await this.page
      .getByRole('link', { name: 'Dashboard', exact: true })
      .click();
    await expect(this.page).toHaveURL(/dashboard\/index/);
    await expect(this.heading).toBeVisible();
  }

  async openQuickLaunch(
    action: 'Leave List' | 'Timesheets' | 'Assign Leave' | 'My Leave',
  ) {
    await this.quickLaunchCard(action).click();
  }
}
