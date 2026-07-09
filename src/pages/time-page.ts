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
  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }
  get editButton() {
    return this.page.getByRole('button', { name: 'Edit' });
  }
  async clickResetButton() {
    await this.resetButton.click();
  }
  async clickEditButton() {
    await this.editButton.click();
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }
  async clickCancelButton() {
    await this.cancelButton.click();
  }

  get timesheetPeriodValue() {
    return this.page.locator('.oxd-date-input input').first();
  }
  async goToNextTimesheetPeriod() {
    await this.page.locator('.orangehrm-timeperiod-icon.--next').click();
  }
  async goToPreviousTimesheetPeriod() {
    await this.page.locator('.orangehrm-timeperiod-icon.--previous').click();
  }
}
