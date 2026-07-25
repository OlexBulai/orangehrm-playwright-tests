import { expect, Locator, Page } from '@playwright/test';
import type {
  EmploymentStatusData,
  EmploymentStatusRecord,
} from '../api/employment-status-api';
import { inputGroup } from './form-controls';

export default class EmploymentStatusComponent {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Employment Status' });
  }

  private get nameInput(): Locator {
    return inputGroup(this.page, 'Name').locator('input');
  }

  private row(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  async openEmploymentStatus(): Promise<void> {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByText('Job', { exact: true })
      .click();
    await this.page
      .getByRole('menuitem', { name: 'Employment Status' })
      .click();
    await expect(this.page).toHaveURL(/admin\/employmentStatus/);
    await expect(this.heading).toBeVisible();
  }

  async expectColumns(): Promise<void> {
    for (const column of ['Employment Status', 'Actions']) {
      await expect(
        this.page.getByRole('columnheader', { name: new RegExp(column) }),
      ).toBeVisible();
    }
  }

  async addEmploymentStatus(data: EmploymentStatusData): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.waitForForm('Add Employment Status');
    await this.nameInput.fill(data.name);
    const responsePromise = this.waitForResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async editEmploymentStatus(
    currentName: string,
    data: EmploymentStatusData,
  ): Promise<void> {
    await this.row(currentName).locator('button:has(i.bi-pencil-fill)').click();
    await this.waitForForm('Edit Employment Status');
    await this.nameInput.fill(data.name);
    const responsePromise = this.waitForResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async deleteEmploymentStatus(name: string): Promise<void> {
    const row = this.row(name);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async expectEmploymentStatus(data: EmploymentStatusData): Promise<void> {
    await expect(this.row(data.name)).toBeVisible();
  }

  async expectRecords(records: EmploymentStatusRecord[]): Promise<void> {
    const rows = this.page.locator('.oxd-table-body .oxd-table-card');
    await expect(rows).toHaveCount(records.length);
    for (const record of records) {
      await this.expectEmploymentStatus(record);
    }
  }

  async expectRequiredNameValidation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.waitForForm('Add Employment Status');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(inputGroup(this.page, 'Name').getByText('Required')).toBeVisible();
  }

  private async waitForForm(heading: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden();
  }

  private waitForResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/admin\/employment-statuses(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
  }
}
