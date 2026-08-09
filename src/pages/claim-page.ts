import { expect, Page } from '@playwright/test';

export default class ClaimPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', {
      name: 'Employee Claims',
      exact: true,
    });
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
    await this.page.getByRole('link', { name: 'Claim', exact: true }).click();
    await expect(this.page).toHaveURL(/claim\/viewAssignClaim/);
    await expect(this.heading).toBeVisible();
  }

  async search() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/claim/'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async openAssignClaimForm() {
    await this.page.getByRole('button', { name: 'Assign Claim' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Create Claim Request' }),
    ).toBeVisible();
  }

  async submitEmptyClaimForm() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }
}
