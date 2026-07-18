import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  inputGroup,
} from './form-controls';

export type DependentData = {
  name: string;
  relationshipType: 'Child' | 'Other';
  relationship?: string;
  dateOfBirth: string;
};

type DependentResponse = {
  id: string;
  name: string;
  relationshipType: 'child' | 'other';
  relationship: string;
  dateOfBirth: string;
};

export default class DependentsComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Assigned Dependents' });
    this.addButton = page.getByRole('button', { name: 'Add' }).first();
    this.confirmDeleteButton = page.getByRole('button', {
      name: 'Yes, Delete',
    });
  }

  private form(): Locator {
    return this.page.locator('form').filter({
      has: exactLabel(this.page, 'Name'),
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private relationshipSelect(): Locator {
    return inputGroup(this.page, 'Relationship').locator('.oxd-select-text');
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

  async fill(data: DependentData) {
    await this.selectRelationship(data.relationshipType);
    await this.input('Name').fill(data.name);

    if (data.relationshipType === 'Other') {
      await this.input('Please Specify').fill(data.relationship ?? '');
    }

    await this.input('Date of Birth').fill(data.dateOfBirth);
  }

  async expectFormValues(data: DependentData) {
    await expect(this.input('Name')).toHaveValue(data.name);
    await expect(this.relationshipSelect()).toContainText(data.relationshipType);
    if (data.relationshipType === 'Other') {
      await expect(this.input('Please Specify')).toHaveValue(
        data.relationship ?? '',
      );
    }
    await expect(this.input('Date of Birth')).toHaveValue(data.dateOfBirth);
  }

  async save(method: 'POST' | 'PUT') {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        /\/api\/v2\/pim\/employees\/\d+\/dependents(?:\/\d+)?$/.test(
          response.url(),
        ),
    );
    await this.form().getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: DependentResponse };
    return {
      data: body.data,
      requestData: response.request().postDataJSON() as Record<string, unknown>,
    };
  }

  async add(data: DependentData) {
    await this.openAddForm();
    await this.fill(data);
    await this.expectFormValues(data);
    return this.save('POST');
  }

  async edit(currentName: string, data: DependentData) {
    await this.getRow(currentName).locator('button:has(i.bi-pencil-fill)').click();
    await expect(this.form()).toBeVisible();
    await this.fill(data);
    await this.expectFormValues(data);
    return this.save('PUT');
  }

  async delete(name: string) {
    await this.getRow(name).locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        /\/api\/v2\/pim\/employees\/\d+\/dependents$/.test(response.url()),
    );
    await this.confirmDeleteButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.getRow(name)).toBeHidden({ timeout: 15_000 });
  }

  async expectDependent(data: DependentData) {
    const row = this.getRow(data.name);
    await expect(row).toBeVisible({ timeout: 15_000 });
    const relationship =
      data.relationshipType === 'Child' ? 'Child' : data.relationship ?? '';
    await expect(row).toContainText(relationship);
  }

  async saveEmptyForm() {
    await this.form().getByRole('button', { name: 'Save' }).click();
  }

  async expectRequiredErrors() {
    await expect(
      this.form().locator('.oxd-input-field-error-message'),
    ).toHaveText(['Required', 'Required']);
  }

  private async selectRelationship(relationship: 'Child' | 'Other') {
    await this.relationshipSelect().locator('.oxd-select-text-input').click();
    const option = this.page.getByRole('option', {
      name: relationship,
      exact: true,
    });
    await expect(option).toBeVisible();
    await option.click();
  }
}
