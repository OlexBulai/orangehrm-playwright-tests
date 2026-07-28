import { expect, Locator, Page } from '@playwright/test';

const salaryColumns = [
  'Salary Component',
  'Amount',
  'Currency',
  'Pay Frequency',
  'Direct Deposit Amount',
] as const;

export default class SalaryComponent {
  readonly heading: Locator;
  readonly attachmentsHeading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', {
      name: 'Assigned Salary Components',
    });
    this.attachmentsHeading = page.getByRole('heading', {
      name: 'Attachments',
    });
  }

  private salaryTable(): Locator {
    return this.heading.locator(
      'xpath=following::div[contains(@class,"orangehrm-container")][1]',
    );
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.attachmentsHeading).toBeVisible();
  }

  async expectSalaryColumns() {
    for (const column of salaryColumns) {
      await expect(
        this.salaryTable().getByRole('columnheader', {
          name: column,
          exact: true,
        }),
      ).toBeVisible();
    }
  }

  async expectReadOnly() {
    await expect(this.page.getByRole('button', { name: 'Add' })).toHaveCount(0);
    await expect(this.page.locator('button:has(i.bi-pencil-fill)')).toHaveCount(
      0,
    );
    await expect(this.page.locator('button:has(i.bi-trash)')).toHaveCount(0);
  }

  async expectSalaryCount(total: number) {
    await this.expectTableCount(
      this.salaryTable(),
      this.page.getByText('No Records Found', { exact: true }).first(),
      total,
    );
  }

  private async expectTableCount(
    table: Locator,
    emptyState: Locator,
    total: number,
  ) {
    if (total === 0) {
      await expect(emptyState).toBeVisible();
      return;
    }

    await expect(table.locator('.oxd-table-body .oxd-table-card')).toHaveCount(
      total,
    );
  }
}
