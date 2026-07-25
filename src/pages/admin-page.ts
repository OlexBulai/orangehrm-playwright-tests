import { expect, Locator, Page } from '@playwright/test';
import { exactLabel, inputGroup, selectDropdownOption } from './components/form-controls';
import type { SystemUserData } from './api/admin-api';

type SystemUserUiData = SystemUserData & {
  employeeName: string;
};

export default class AdminPage {
  readonly heading: Locator;
  readonly addButton: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'System Users' });
    this.addButton = page.getByRole('button', { name: 'Add' });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private dropdown(label: string): Locator {
    return inputGroup(this.page, label).locator('.oxd-select-text');
  }

  private userRow(username: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: username, exact: true }),
    });
  }

  async openAdminPage() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async searchSystemUser(username: string) {
    await this.input('Username').fill(username);
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/admin/users?'),
    );
    await this.page.getByRole('button', { name: 'Search' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async resetSearchFilters() {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await expect(this.input('Username')).toHaveValue('');
  }

  async addSystemUser(data: SystemUserUiData) {
    await this.addButton.click();
    await expect(this.page.getByRole('heading', { name: 'Add User' })).toBeVisible();
    await this.fillUserForm(data);
    const responsePromise = this.waitForUserResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async editSystemUserStatus(username: string, status: 'Enabled' | 'Disabled') {
    await this.userRow(username).locator('button:has(i.bi-pencil-fill)').click();
    await expect(this.page).toHaveURL(/admin\/saveSystemUser\/\d+/);
    await expect(
      this.page.getByRole('heading', { name: 'Edit User' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden({
      timeout: 30_000,
    });
    await selectDropdownOption(this.page, this.dropdown('Status'), status);
    const responsePromise = this.waitForUserResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async deleteSystemUser(username: string) {
    const row = this.userRow(username);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForUserResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async expectSystemUser(data: {
    username: string;
    role: string;
    employeeName: string;
    status: string;
  }) {
    const row = this.userRow(data.username);
    await expect(row).toBeVisible();
    await expect(row).toContainText(data.role);
    await expect(row).toContainText(data.employeeName);
    await expect(row).toContainText(data.status);
  }

  private async fillUserForm(data: SystemUserUiData) {
    await selectDropdownOption(this.page, this.dropdown('User Role'), data.role);
    await selectDropdownOption(this.page, this.dropdown('Status'), data.status);
    await this.input('Employee Name').fill(data.employeeName);
    await this.page.getByRole('option').filter({ hasText: data.employeeName }).click();
    await this.input('Username').fill(data.username);
    await this.input('Password').fill(data.password);
    await this.input('Confirm Password').fill(data.password);
  }

  private waitForUserResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/admin\/users(?:\/\d+)?$/.test(response.url()),
    );
  }
}
