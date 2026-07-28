import { expect, Locator, Page } from '@playwright/test';
import type { WorkShiftData, WorkShiftRecord } from '../api/work-shifts-api';
import { inputGroup } from './form-controls';

type WorkShiftExpected = {
  name: string;
  startTime: string;
  endTime: string;
  hoursPerDay: string | number;
};

export default class WorkShiftsComponent {
  readonly heading: Locator;
  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Work Shifts' });
  }

  private row(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  async openWorkShifts(): Promise<void> {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    const navigation = this.page.getByRole('navigation', {
      name: 'Topbar Menu',
    });
    await navigation.getByText('Job', { exact: true }).click();
    await this.page.getByRole('menuitem', { name: 'Work Shifts' }).click();
    await expect(this.page).toHaveURL(/admin\/workShift/);
    await expect(this.heading).toBeVisible();
  }

  async expectColumns(): Promise<void> {
    for (const column of ['Name', 'From', 'To', 'Hours Per Day', 'Actions']) {
      await expect(
        this.page.getByRole('columnheader', { name: new RegExp(column) }),
      ).toBeVisible();
    }
  }

  async addWorkShift(data: WorkShiftData): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.waitForForm('Add Work Shift');
    await this.fillForm(data);
    const responsePromise = this.waitForResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async editWorkShift(currentName: string, data: WorkShiftData): Promise<void> {
    await this.row(currentName).locator('button:has(i.bi-pencil-fill)').click();
    await this.waitForForm('Edit Work Shift');
    await this.fillForm(data);
    const responsePromise = this.waitForResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async deleteWorkShift(name: string): Promise<void> {
    const row = this.row(name);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async expectWorkShift(data: WorkShiftExpected): Promise<void> {
    const row = this.row(data.name);
    await expect(row).toBeVisible();
    for (const value of [
      data.name,
      this.toUiTime(data.startTime),
      this.toUiTime(data.endTime),
      Number(data.hoursPerDay).toFixed(2),
    ]) {
      await expect(
        row.getByRole('cell', { name: value, exact: true }),
      ).toBeVisible();
    }
  }

  async expectRecords(records: WorkShiftRecord[]): Promise<void> {
    const rows = this.page.locator('.oxd-table-body .oxd-table-card');
    await expect(rows).toHaveCount(records.length);
    for (const record of records) await this.expectWorkShift(record);
  }

  async expectRequiredNameValidation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.waitForForm('Add Work Shift');
    await this.input('Shift Name').fill('');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(
      inputGroup(this.page, 'Shift Name').getByText('Required'),
    ).toBeVisible();
  }

  private async fillForm(data: WorkShiftData): Promise<void> {
    await this.input('Shift Name').fill(data.name);
    await this.input('From').fill(this.toUiTime(data.startTime));
    await this.input('To').fill(this.toUiTime(data.endTime));
  }

  private toUiTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`;
  }

  private async waitForForm(heading: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: heading }),
    ).toBeVisible();
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden();
  }

  private waitForResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/admin\/work-shifts(?:\/\d+)?$/.test(response.url()),
    );
  }
}
