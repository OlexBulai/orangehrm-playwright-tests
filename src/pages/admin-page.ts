import { Page, Locator, expect } from '@playwright/test';

export default class AdminPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly statusDropdown: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.locator('.oxd-input').nth(1);
    this.userRoleDropdown = page.locator('.oxd-select-text').first();
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.statusDropdown = page.locator('.oxd-select-text').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }
  async openAdminPage() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await expect(this.page).toHaveURL(/.*\/admin/);
  }
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillUserRole(userRole: string) {
    await this.userRoleDropdown.click();
    await this.page.getByRole('option', { name: userRole }).click();
  }

  async fillEmployeeName(employeeName: string) {
    await this.employeeNameInput.fill(employeeName);
  }

  async fillStatus(status: string) {
    await this.statusDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
  }

  async clickSearchButton() {
    await this.searchButton.click();
  }
}
