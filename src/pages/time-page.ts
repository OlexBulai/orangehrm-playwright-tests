import { expect, Page } from '@playwright/test';

export default class TimePage {
  constructor(private readonly page: Page) {}

  get timesheetsHeading() {
    return this.page.getByRole('heading', {
      name: 'Timesheets Pending Action',
    });
  }

  get requiredMessages() {
    return this.page.getByText('Required');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Time' }).click();

    await this.timesheetsHeading.waitFor({ state: 'visible' });
  }

  async selectAvailableEmployee() {
    const employeeName = (
      await this.page
        .locator('.oxd-table-body .oxd-table-card')
        .first()
        .locator('.oxd-table-cell')
        .first()
        .innerText()
    ).trim();
    const employeeInput = this.page.getByPlaceholder('Type for hints...');

    await employeeInput.fill(employeeName.split(/\s+/)[0]);

    await this.page
      .getByRole('option')
      .filter({ hasText: employeeName })
      .click();

    return employeeName;
  }

  async selectEmployee(employeeName: string) {
    const employeeInput = this.page.getByPlaceholder('Type for hints...');
    await employeeInput.fill(employeeName);
    await this.page
      .getByRole('option', { name: employeeName, exact: true })
      .click();
  }
  get viewButton() {
    return this.page.getByRole('button', { name: 'View' }).first();
  }
  async clickViewTimesheetButton() {
    await Promise.all([
      this.page.waitForURL(/\/time\/viewTimesheet\/employeeId\/\d+/),
      this.viewButton.click(),
    ]);
    await this.timesheetForText.waitFor({ state: 'visible' });
  }
  get timesheetForText() {
    return this.page.getByText('Timesheet for');
  }
  get timesheetPeriodValue() {
    return this.page.locator('.oxd-date-input input').first();
  }
  async goToNextTimesheetPeriod() {
    await this.page.locator('.orangehrm-timeperiod-icon.--next').click();
  }

  async editTimesheet() {
    const createTimesheetButton = this.page.getByRole('button', {
      name: 'Create Timesheet',
    });

    if (await createTimesheetButton.isVisible()) {
      const responsePromise = this.page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().endsWith('/api/v2/time/timesheets'),
      );
      await createTimesheetButton.click();
      const response = await responsePromise;
      expect(response.status(), await response.text()).toBe(200);
    } else {
      await this.page.getByRole('button', { name: 'Edit' }).click();
    }
    await this.page.getByText('Add Row', { exact: true }).waitFor();
  }

  async addTimesheetEntry(
    projectName: string,
    activityName: string,
    hours: string,
  ) {
    const entryRows = this.page
      .getByRole('row')
      .filter({ has: this.page.getByPlaceholder('Type for hints...') });
    await this.page.getByText('Add Row', { exact: true }).click();
    await expect(entryRows).not.toHaveCount(0);
    const row = entryRows.last();
    const projectInput = row.getByPlaceholder('Type for hints...');
    await projectInput.fill(projectName);
    await this.page
      .getByRole('option')
      .filter({ hasText: projectName })
      .click();
    await row.locator('.oxd-select-text').click();
    await this.page
      .getByRole('option', { name: activityName, exact: true })
      .click();
    await row.locator('input').nth(1).fill(hours);
  }

  async saveTimesheet() {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.getByRole('button', { name: 'Submit' }).waitFor();
  }

  async submitTimesheet() {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async openAttendanceEmployeeRecords() {
    await this.page.getByText('Attendance', { exact: true }).click();
    await this.page
      .getByRole('menuitem', { name: 'Employee Records', exact: true })
      .click();
    await this.page.waitForURL(/attendance\/viewAttendanceRecord/);
  }

  async openProjectCustomers() {
    await this.page.getByText('Project Info', { exact: true }).click();
    await this.page
      .getByRole('menuitem', { name: 'Customers', exact: true })
      .click();
    await this.page.waitForURL(/time\/viewCustomers/);
  }

  async openAddCustomerForm() {
    await this.openProjectCustomers();
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.page
      .getByRole('heading', { name: 'Add Customer', exact: true })
      .waitFor({ state: 'visible' });
  }

  async saveEmptyCustomerForm() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async createCustomer(name: string, description: string) {
    await this.openAddCustomerForm();
    await this.page.locator('form input').fill(name);
    await this.page.getByPlaceholder('Type description here').fill(description);
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith('/api/v2/time/customers'),
    );
    await this.page.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async deleteCustomer(name: string) {
    const row = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().endsWith('/api/v2/time/customers'),
    );
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }
}
