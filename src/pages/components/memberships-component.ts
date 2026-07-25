import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  replaceInputValue,
  selectDropdownOption,
} from './form-controls';
import AttachmentsComponent from './attachments-component';

export type MembershipData = {
  membership: string;
  paidBy: 'Company' | 'Individual';
  amount: string;
  currency: string;
  commenceDate: string;
  renewalDate: string;
};

export type MembershipRecord = {
  id: number;
  membership: { id: number; name: string };
  subscriptionFee: string;
  subscriptionPaidBy: string;
  currencyType: { id: string; name: string };
  subscriptionCommenceDate: string | null;
  subscriptionRenewalDate: string | null;
};

function toUiDate(apiDate: string | null): string {
  if (apiDate === null) return '';
  const [year, month, day] = apiDate.split('-');
  return `${year}-${day}-${month}`;
}

export default class MembershipsComponent {
  readonly heading: Locator;
  readonly attachmentsHeading: Locator;
  readonly attachments: AttachmentsComponent;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Assigned Memberships' });
    this.attachmentsHeading = page.getByRole('heading', { name: 'Attachments' });
    this.attachments = new AttachmentsComponent(page, 'membership');
  }

  private form(): Locator {
    return this.page.locator('form:visible').last();
  }

  private group(label: string): Locator {
    return this.form()
      .locator('.oxd-input-group')
      .filter({ has: exactLabel(this.page, label) });
  }

  private input(label: string): Locator {
    return this.group(label).locator('input');
  }

  private row(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.attachmentsHeading).toBeVisible();
  }

  async expectColumns() {
    const columns = [
      'Membership',
      'Subscription Paid By',
      'Subscription Amount',
      'Currency',
      'Subscription Commence Date',
      'Subscription Renewal Date',
      'Actions',
    ];
    for (const column of columns) {
      await expect(
        this.page.getByRole('columnheader', { name: column, exact: true }).first(),
      ).toBeVisible();
    }
  }

  async openAddForm() {
    await this.heading
      .locator('xpath=following::button[contains(normalize-space(.),"Add")][1]')
      .click();
    await expect(this.form()).toBeVisible();
  }

  async addMembership(data: MembershipData): Promise<number> {
    await this.openAddForm();
    await this.fill(data);
    const saved = await this.save<{ data: MembershipRecord }>('POST');
    await this.expectMembership(data.membership, data.amount);
    return saved.data.id;
  }

  async editMembership(currentName: string, data: MembershipData) {
    await this.row(currentName).locator('button:has(i.bi-pencil-fill)').click();
    await this.fill(data);
    await this.save('PUT');
    await this.page.reload();
    await this.expectMembership(data.membership, data.amount);
  }

  async deleteMembership(name: string) {
    const row = this.row(name);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().endsWith('/memberships'),
    );
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(row).toBeHidden();
  }

  async saveEmptyForm() {
    await this.form().getByRole('button', { name: 'Save' }).click();
  }

  async expectRequiredError() {
    await expect(this.form().getByText('Required').first()).toBeVisible();
  }

  async expectRecords(records: MembershipRecord[]) {
    const rows = this.heading
      .locator('xpath=following::div[contains(@class,"orangehrm-container")][1]')
      .locator('.oxd-table-body .oxd-table-card');
    await expect(rows).toHaveCount(records.length);
    for (const record of records) {
      const row = rows.filter({ hasText: record.membership.name });
      await expect(row).toContainText(record.subscriptionPaidBy ?? '');
      await expect(row).toContainText(record.subscriptionFee ?? '');
      await expect(row).toContainText(record.currencyType?.name ?? '');
      await expect(row).toContainText(toUiDate(record.subscriptionCommenceDate));
      await expect(row).toContainText(toUiDate(record.subscriptionRenewalDate));
    }
  }

  async expectMembership(name: string, amount: string) {
    const row = this.row(name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(amount);
  }

  private async fill(data: MembershipData) {
    const selects = this.form().locator('.oxd-select-text');
    await selectDropdownOption(this.page, selects.nth(0), data.membership);
    await selectDropdownOption(this.page, selects.nth(1), data.paidBy);
    await replaceInputValue(this.input('Subscription Amount'), data.amount);
    // The long currency list is virtualized, so choose its first real option
    // by keyboard instead of depending on an option that may not be in the DOM.
    await selects.nth(2).click();
    await selects.nth(2).press('ArrowDown');
    await selects.nth(2).press('Enter');
    await replaceInputValue(
      this.input('Subscription Commence Date'),
      data.commenceDate,
    );
    await replaceInputValue(
      this.input('Subscription Renewal Date'),
      data.renewalDate,
    );
  }

  private async save<T>(method: 'POST' | 'PUT'): Promise<T> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/pim\/employees\/\d+\/memberships(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
    await this.form().getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return (await response.json()) as T;
  }
}
