import { Page, expect } from '@playwright/test';

export default class MyInfoPage {
  readonly myInfoLink = this.page.getByRole('link', { name: 'My Info' });
  readonly personalDetailsTitle = 'h6';
  readonly contactDeailsTitle = 'h6';
  constructor(private page: Page) {}
  async openMyInfo() {
    await this.myInfoLink.click();
  }
  async expectPersonalDetailsVisible() {
    await expect(
      this.page
        .locator(this.personalDetailsTitle)
        .getByText('Personal Details'),
    ).toBeVisible();
  }
  async openContactDetails() {
    await this.page.getByRole('link', { name: 'Contact Details' }).click();
  }
  async expectContactDetailsVisible() {
    await expect(
      this.page.locator(this.contactDeailsTitle).getByText('Contact Details'),
    ).toBeVisible();
  }
}
