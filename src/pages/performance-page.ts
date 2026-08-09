import { expect, Page } from '@playwright/test';
import { inputGroup, replaceInputValue } from './components/form-controls';

export default class PerformancePage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', {
      name: 'Employee Reviews',
      exact: true,
    });
  }

  get kpisHeading() {
    return this.page.getByRole('heading', {
      name: 'Key Performance Indicators for Job Title',
      exact: true,
    });
  }

  get trackersHeading() {
    return this.page.getByRole('heading', {
      name: 'Performance Trackers',
      exact: true,
    });
  }

  get employeeNameInput() {
    return this.page.getByPlaceholder('Type for hints...');
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  get requiredMessages() {
    return this.page.locator('.oxd-input-field-error-message');
  }

  get reviewStatusSelect() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Review Status' })
      .locator('.oxd-select-text');
  }

  async selectReviewStatus(status: string) {
    await this.reviewStatusSelect.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
  }

  async openKpis() {
    await this.openConfigureMenuItem('KPIs');
  }

  async openTrackers() {
    await this.openConfigureMenuItem('Trackers');
  }

  async openAddKpiForm() {
    await this.openKpis();
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/performance\/saveKpi/);
    await expect(
      this.page.getByText('Add Key Performance Indicator', { exact: true }),
    ).toBeVisible();
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden({
      timeout: 30_000,
    });
  }

  async openAddTrackerForm() {
    await this.openTrackers();
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/performance\/addPerformanceTracker/);
    await expect(
      this.page.getByRole('heading', { name: 'Add Performance Tracker' }),
    ).toBeVisible();
  }

  async openAddReviewForm() {
    const navigation = this.page.getByRole('navigation', {
      name: 'Topbar Menu',
    });
    await navigation.getByText('Manage Reviews', { exact: true }).click();
    await this.page
      .getByRole('menuitem', { name: 'Manage Reviews', exact: true })
      .click();
    await expect(this.page).toHaveURL(/performance\/searchPerformanceReview/);
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/performance\/saveReview/);
    await expect(
      this.page.getByRole('heading', { name: 'Add Review' }),
    ).toBeVisible();
  }

  async saveEmptyForm() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  private kpiRow(name: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  private async fillKpiForm(
    name: string,
    minimumRating: string,
    maximumRating: string,
    selectJobTitle: boolean,
  ) {
    if (selectJobTitle) {
      const jobTitleSelect = inputGroup(this.page, 'Job Title').locator(
        '.oxd-select-text',
      );
      await jobTitleSelect.click();
      await this.page.getByRole('option').nth(1).click();
      await expect(jobTitleSelect).not.toContainText('-- Select --');
    }
    await replaceInputValue(
      inputGroup(this.page, 'Key Performance Indicator').locator('input'),
      name,
    );
    await replaceInputValue(
      inputGroup(this.page, 'Minimum Rating').locator('input'),
      minimumRating,
    );
    await replaceInputValue(
      inputGroup(this.page, 'Maximum Rating').locator('input'),
      maximumRating,
    );
  }

  async createKpi(name: string, minimumRating: string, maximumRating: string) {
    await this.openAddKpiForm();
    await this.fillKpiForm(name, minimumRating, maximumRating, true);
    const responsePromise = this.waitForKpiResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async editKpi(
    currentName: string,
    updatedName: string,
    minimumRating: string,
    maximumRating: string,
  ) {
    await this.kpiRow(currentName)
      .locator('button:has(i.bi-pencil-fill)')
      .click();
    await expect(this.page.locator('.oxd-form-loader')).toBeHidden({
      timeout: 30_000,
    });
    await this.fillKpiForm(updatedName, minimumRating, maximumRating, false);
    await expect(
      inputGroup(this.page, 'Key Performance Indicator').locator('input'),
    ).toHaveValue(updatedName);
    const responsePromise = this.waitForKpiResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async expectKpi(name: string) {
    await expect(this.kpiRow(name)).toBeVisible();
  }

  async deleteKpi(name: string) {
    const row = this.kpiRow(name);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForKpiResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  private trackerRow(name: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  private async selectTrackerEmployee(
    label: 'Employee Name' | 'Reviewers',
    employeeName: string,
  ) {
    const input = inputGroup(this.page, label).getByPlaceholder(
      'Type for hints...',
    );
    await input.fill(employeeName);
    await this.page
      .getByRole('option')
      .filter({ hasText: employeeName })
      .click();
  }

  async createTracker(
    name: string,
    employeeName: string,
    reviewerName: string,
  ): Promise<number> {
    await this.openAddTrackerForm();
    await inputGroup(this.page, 'Tracker Name').locator('input').fill(name);
    await this.selectTrackerEmployee('Employee Name', employeeName);
    await this.selectTrackerEmployee('Reviewers', reviewerName);

    const responsePromise = this.waitForTrackerResponse('POST');
    await this.page.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async expectTracker(name: string) {
    await expect(this.trackerRow(name)).toBeVisible();
  }

  async editTracker(currentName: string, updatedName: string) {
    await this.trackerRow(currentName)
      .locator('button:has(i.bi-pencil-fill)')
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Edit Performance Tracker' }),
    ).toBeVisible();
    await replaceInputValue(
      inputGroup(this.page, 'Tracker Name').locator('input'),
      updatedName,
    );

    const responsePromise = this.waitForTrackerResponse('PUT');
    await this.page.getByRole('button', { name: 'Save' }).click();
    expect((await responsePromise).status()).toBe(200);
  }

  async deleteTracker(name: string) {
    const row = this.trackerRow(name);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.waitForTrackerResponse('DELETE');
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async open() {
    await this.page
      .getByRole('link', { name: 'Performance', exact: true })
      .click();
    await expect(this.page).toHaveURL(
      /performance\/searchEvaluatePerformanceReview/,
    );
    await expect(this.heading).toBeVisible();
  }

  private async openConfigureMenuItem(itemName: 'KPIs' | 'Trackers') {
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByText('Configure', { exact: true })
      .click();
    await this.page
      .getByRole('menuitem', { name: itemName, exact: true })
      .click();
  }

  private waitForKpiResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/performance\/kpis(?:\/\d+)?$/.test(response.url()),
    );
  }

  private waitForTrackerResponse(method: 'POST' | 'PUT' | 'DELETE') {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/performance\/config\/trackers(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
  }
}
