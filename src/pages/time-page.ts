import { Page } from '@playwright/test';
import { get } from 'https';

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
    await this.page
      .getByRole('link', { name: 'Time' })
      .click({ noWaitAfter: true });

    await this.timesheetsHeading.waitFor({ state: 'visible' });
  }

  async viewTimesheet() {
    await this.page.getByRole('button', { name: 'View' }).click();
  }

  async fillEmployeeName(employeeName: string) {
    const employeeInput = this.page.getByPlaceholder('Type for hints...');

    await employeeInput.fill(employeeName);

    await this.page
      .getByRole('option')
      .filter({ hasText: employeeName })
      .click();
  }
  get viewButton() {
    return this.page.getByRole('button', { name: 'View' }).first();
  }
  async clickViewTimesheetButton() {
    await this.viewButton.click();
  }
  get timesheetForText() {
    return this.page.getByText('Timesheet for');
  }
}
