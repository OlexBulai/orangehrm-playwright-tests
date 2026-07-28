import { expect, Page } from '@playwright/test';

export default class BuzzPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Buzz', exact: true });
  }

  get postInput() {
    return this.page.getByPlaceholder("What's on your mind?");
  }

  get posts() {
    return this.page.locator('.orangehrm-buzz-post');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Buzz', exact: true }).click();
    await expect(this.page).toHaveURL(/buzz\/viewBuzz/);
    await expect(this.heading).toBeVisible();
  }
}
