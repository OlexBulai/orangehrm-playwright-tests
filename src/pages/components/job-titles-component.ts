import { expect, Locator, Page } from '@playwright/test';
import type { JobTitleData, JobTitleRecord } from '../api/job-titles-api';
import { inputGroup } from './form-controls';

export default class JobTitlesComponent {
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Job Titles' });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private textarea(label: string): Locator {
    return inputGroup(this.page, label).locator('textarea');
  }

  private row(title: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: title, exact: true }),
    });
  }

  async openJobTitles() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByText('Job', { exact: true })
      .click();
    await this.page.getByRole('menuitem', { name: 'Job Titles' }).click();
    await expect(this.page).toHaveURL(/admin\/viewJobTitleList/);
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      await this.page.reload();
      await expect(this.heading).toBeVisible({ timeout: 30_000 });
    }
  }

  async expectColumns() {
    for (const column of ['Job Titles', 'Job Description', 'Actions']) {
      await expect(
        this.page.getByRole('columnheader', { name: new RegExp(column) }),
      ).toBeVisible();
    }
  }

  async addJobTitle(data: JobTitleData) {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/admin\/saveJobTitle/);
    await this.waitForForm('Add Job Title');
    await this.fillForm(data);
    const responsePromise = this.waitForResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: JobTitleRecord }).data.id;
  }

  async editJobTitle(currentTitle: string, data: JobTitleData) {
    await this.row(currentTitle)
      .locator('button:has(i.bi-pencil-fill)')
      .click();
    await expect(this.page).toHaveURL(/admin\/saveJobTitle\/\d+/);
    await this.waitForForm('Edit Job Title');
    await this.fillForm(data);
    const responsePromise = this.waitForResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(this.page).toHaveURL(/admin\/viewJobTitleList/);
    await expect(this.heading).toBeVisible();
  }

  async deleteJobTitle(title: string) {
    const row = this.row(title);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async expectJobTitle(data: { title: string; description: string | null }) {
    const row = this.row(data.title);
    await expect(row).toBeVisible();
    if (data.description) {
      await expect(row).toContainText(data.description.slice(0, 30));
    }
  }

  async expectRecords(records: JobTitleRecord[]) {
    const rows = this.page.locator('.oxd-table-body .oxd-table-card');
    await expect(rows).toHaveCount(records.length);
    for (const record of records) {
      await this.expectJobTitle(record);
    }
  }

  async expectRequiredTitleValidation() {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.waitForForm('Add Job Title');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(
      inputGroup(this.page, 'Job Title').getByText('Required'),
    ).toBeVisible();
  }

  private async waitForForm(heading: string) {
    await expect(this.page.getByRole('heading', { name: heading })).toBeVisible(
      {
        timeout: 20_000,
      },
    );
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden({
      timeout: 30_000,
    });
  }

  private async fillForm(data: JobTitleData) {
    await this.input('Job Title').fill(data.title);
    await this.textarea('Job Description').fill(data.description);
    await this.textarea('Note').fill(data.note);
  }

  private waitForResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/admin\/job-titles(?:\/\d+)?$/.test(response.url()),
    );
  }
}
