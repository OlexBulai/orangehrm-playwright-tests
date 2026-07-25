import { Page } from '@playwright/test';

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
}
