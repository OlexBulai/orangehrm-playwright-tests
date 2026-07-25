import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  inputGroup,
  selectDropdownOption,
} from './form-controls';

export type ImmigrationDocumentData = {
  documentType: 'Passport' | 'Visa';
  number: string;
  issuedDate: string;
  expiryDate: string;
  eligibleStatus: string;
  issuedBy: { name: string; code: string };
  eligibleReviewDate: string;
  comments: string;
};

type ImmigrationResponse = {
  id: string;
  number: string;
  issuedDate: string | null;
  expiryDate: string | null;
  type: 1 | 2;
  status: string | null;
  reviewDate: string | null;
  country: { code: string | null; name: string | null };
  comment: string | null;
};

export default class ImmigrationComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      name: 'Assigned Immigration Records',
    });
    this.addButton = page.getByRole('button', { name: 'Add' }).first();
    this.confirmDeleteButton = page.getByRole('button', {
      name: 'Yes, Delete',
    });
  }

  private form(): Locator {
    return this.page.locator('form').filter({
      has: exactLabel(this.page, 'Number'),
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private issuedBySelect(): Locator {
    return inputGroup(this.page, 'Issued By').locator('.oxd-select-text');
  }

  private comments(): Locator {
    return inputGroup(this.page, 'Comments').locator('textarea');
  }

  getRow(number: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: number, exact: true }),
    });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async openAddForm() {
    await this.addButton.click();
    await expect(this.form()).toBeVisible();
  }

  async fill(data: ImmigrationDocumentData) {
    await exactLabel(this.page, data.documentType).click();
    await this.input('Number').fill(data.number);
    await this.input('Issued Date').fill(data.issuedDate);
    await this.input('Expiry Date').fill(data.expiryDate);
    await this.input('Eligible Status').fill(data.eligibleStatus);
    await selectDropdownOption(
      this.page,
      this.issuedBySelect(),
      data.issuedBy.name,
    );
    await this.input('Eligible Review Date').fill(data.eligibleReviewDate);
    await this.comments().fill(data.comments);
  }

  async expectFormValues(data: ImmigrationDocumentData) {
    const typeValue = data.documentType === 'Passport' ? '1' : '2';
    await expect(
      this.form().locator(`input[type="radio"][value="${typeValue}"]`),
    ).toBeChecked();
    await expect(this.input('Number')).toHaveValue(data.number);
    await expect(this.input('Issued Date')).toHaveValue(data.issuedDate);
    await expect(this.input('Expiry Date')).toHaveValue(data.expiryDate);
    await expect(this.input('Eligible Status')).toHaveValue(
      data.eligibleStatus,
    );
    await expect(this.issuedBySelect()).toContainText(data.issuedBy.name);
    await expect(this.input('Eligible Review Date')).toHaveValue(
      data.eligibleReviewDate,
    );
    await expect(this.comments()).toHaveValue(data.comments);
  }

  private async save(method: 'POST' | 'PUT') {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/pim\/employees\/\d+\/immigrations(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
    await this.form().getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: ImmigrationResponse };
    return {
      data: body.data,
      requestData: response.request().postDataJSON() as Record<string, unknown>,
    };
  }

  async addImmigrationDocument(data: ImmigrationDocumentData) {
    await this.openAddForm();
    await this.fill(data);
    await this.expectFormValues(data);
    return this.save('POST');
  }

  async editImmigrationDocument(currentNumber: string, data: ImmigrationDocumentData) {
    await this.getRow(currentNumber).locator('button:has(i.bi-pencil-fill)').click();
    await expect(this.form()).toBeVisible();
    await this.fill(data);
    await this.expectFormValues(data);
    return this.save('PUT');
  }

  async deleteImmigrationDocument(number: string) {
    await this.getRow(number).locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        /\/api\/v2\/pim\/employees\/\d+\/immigrations$/.test(response.url()),
    );
    await this.confirmDeleteButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.getRow(number)).toBeHidden({ timeout: 15_000 });
  }

  async expectDocument(data: ImmigrationDocumentData) {
    const row = this.getRow(data.number);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(new RegExp(data.documentType, 'i'));
  }

  async saveEmptyForm() {
    await this.form().getByRole('button', { name: 'Save' }).click();
  }

  async expectRequiredError() {
    await expect(
      this.form().locator('.oxd-input-field-error-message'),
    ).toHaveText('Required');
  }
}
