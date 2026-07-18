import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  inputGroup,
  replaceInputValue,
} from './form-controls';

export type EmergencyContactData = {
  name: string;
  relationship: string;
  homePhone: string;
  mobilePhone: string;
  workPhone: string;
};

type EmergencyContactResponse = {
  id: string;
  name: string;
  relationship: string;
  homePhone: string | null;
  officePhone: string | null;
  mobilePhone: string | null;
};

type EmergencyContactRequest = {
  name: string;
  relationship: string;
  homePhone: string;
  mobilePhone: string;
  officePhone: string;
};

export default class EmergencyContactsComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Emergency Contacts' });
    this.addButton = page.getByRole('button', { name: 'Add' }).first();
    this.confirmDeleteButton = page.getByRole('button', {
      name: 'Yes, Delete',
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private form(): Locator {
    return this.page.locator('form').filter({
      has: exactLabel(this.page, 'Name'),
    });
  }

  getRow(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async openAddForm() {
    await this.addButton.click();
    await expect(this.form()).toBeVisible();
  }

  async fill(data: EmergencyContactData) {
    await this.fillInput('Name', data.name);
    await this.fillInput('Relationship', data.relationship);
    await this.fillInput('Home Telephone', data.homePhone);
    await this.fillInput('Mobile', data.mobilePhone);
    await this.fillInput('Work Telephone', data.workPhone);
  }

  private async fillInput(label: string, value: string) {
    await replaceInputValue(this.input(label), value);
  }

  async save(method: 'POST' | 'PUT') {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/pim\/employees\/\d+\/emergency-contacts(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
    await this.form().getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: EmergencyContactResponse };
    return {
      data: body.data,
      requestData: response.request().postDataJSON() as EmergencyContactRequest,
    };
  }

  async add(data: EmergencyContactData) {
    await this.openAddForm();
    await this.fill(data);
    return this.save('POST');
  }

  async edit(currentName: string, data: EmergencyContactData) {
    await this.getRow(currentName).locator('button:has(i.bi-pencil-fill)').click();
    await expect(this.form()).toBeVisible();
    await this.fill(data);
    await this.expectFormValues(data);
    return this.save('PUT');
  }

  async expectFormValues(data: EmergencyContactData) {
    await expect(this.input('Name')).toHaveValue(data.name);
    await expect(this.input('Relationship')).toHaveValue(data.relationship);
    await expect(this.input('Home Telephone')).toHaveValue(data.homePhone);
    await expect(this.input('Mobile')).toHaveValue(data.mobilePhone);
    await expect(this.input('Work Telephone')).toHaveValue(data.workPhone);
  }

  async delete(name: string) {
    await this.getRow(name).locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        /\/api\/v2\/pim\/employees\/\d+\/emergency-contacts$/.test(
          response.url(),
        ),
    );
    await this.confirmDeleteButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await this.expectHidden(name);
  }

  async expectContact(data: EmergencyContactData) {
    const row = this.getRow(data.name);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(data.relationship);
    await expect(row).toContainText(data.homePhone);
    await expect(row).toContainText(data.mobilePhone);
    await expect(row).toContainText(data.workPhone);
  }

  async expectHidden(name: string) {
    await expect(this.getRow(name)).toBeHidden({ timeout: 15_000 });
  }

  async saveEmptyForm() {
    await this.form().getByRole('button', { name: 'Save' }).click();
  }

  async expectValidationErrors(messages: string[]) {
    await expect(
      this.form().locator('.oxd-input-field-error-message'),
    ).toHaveText(messages);
  }
}
