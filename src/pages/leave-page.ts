import { expect, Page } from '@playwright/test';

export default class LeavePage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Leave List', exact: true });
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  get requiredMessages() {
    return this.page.locator('.oxd-input-field-error-message');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Leave', exact: true }).click();
    await expect(this.page).toHaveURL(/leave\/viewLeaveList/);
    await expect(this.heading).toBeVisible();
  }

  async search() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/leave/employees/leave-requests'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async openAssignLeave() {
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByRole('link', { name: 'Assign Leave', exact: true })
      .click();
    await expect(this.page).toHaveURL(/leave\/assignLeave/);
    await expect(
      this.page.getByRole('heading', { name: 'Assign Leave', exact: true }),
    ).toBeVisible();
  }

  async submitEmptyAssignLeaveForm() {
    await this.page.getByRole('button', { name: 'Assign' }).click();
  }
}
