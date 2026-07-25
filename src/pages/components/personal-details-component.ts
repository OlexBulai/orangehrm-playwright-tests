import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  inputGroup,
  replaceInputValue,
  selectDropdownOption,
} from './form-controls';

export type EmployeeName = {
  firstName: string;
  middleName: string;
  lastName: string;
};

export type EmployeeIdentifiers = {
  employeeId: string;
  otherId: string;
};

export type DrivingLicenseDetails = {
  number: string;
  expiryDate: string;
};

export type PersonalSelections = {
  nationality?: string;
  maritalStatus: string;
  gender: 'Male' | 'Female';
};

export default class PersonalDetailsComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Personal Details' });
    this.form = page.locator('form').filter({
      has: page.locator('input[name="firstName"]'),
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  private select(label: string): Locator {
    return inputGroup(this.page, label).locator('.oxd-select-text');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async fillEmployeeName(data: EmployeeName) {
    await replaceInputValue(this.page.locator('input[name="firstName"]'), data.firstName);
    await replaceInputValue(this.page.locator('input[name="middleName"]'), data.middleName);
    await replaceInputValue(this.page.locator('input[name="lastName"]'), data.lastName);
  }

  async expectEmployeeName(data: EmployeeName) {
    await expect(this.page.locator('input[name="firstName"]')).toHaveValue(data.firstName);
    await expect(this.page.locator('input[name="middleName"]')).toHaveValue(data.middleName);
    await expect(this.page.locator('input[name="lastName"]')).toHaveValue(data.lastName);
  }

  async fillIdentifiers(data: EmployeeIdentifiers) {
    await replaceInputValue(this.input('Employee Id'), data.employeeId);
    await replaceInputValue(this.input('Other Id'), data.otherId);
  }

  async expectIdentifiers(data: EmployeeIdentifiers) {
    await expect(this.input('Employee Id')).toHaveValue(data.employeeId);
    await expect(this.input('Other Id')).toHaveValue(data.otherId);
  }

  async fillDrivingLicense(data: DrivingLicenseDetails) {
    await replaceInputValue(this.input("Driver's License Number"), data.number);
    await replaceInputValue(this.input('License Expiry Date'), data.expiryDate);
  }

  async expectDrivingLicense(data: DrivingLicenseDetails) {
    await expect(this.input("Driver's License Number")).toHaveValue(data.number);
    await expect(this.input('License Expiry Date')).toHaveValue(data.expiryDate);
  }

  async fillSelections(data: PersonalSelections) {
    if (data.nationality !== undefined) {
      await selectDropdownOption(
        this.page,
        this.select('Nationality'),
        data.nationality,
      );
    }
    await selectDropdownOption(
      this.page,
      this.select('Marital Status'),
      data.maritalStatus,
    );
    await exactLabel(this.page, data.gender).click();
  }

  async expectSelections(data: PersonalSelections) {
    if (data.nationality !== undefined) {
      await expect(this.select('Nationality')).toContainText(data.nationality);
    }
    await expect(this.select('Marital Status')).toContainText(data.maritalStatus);
    const genderValue = data.gender === 'Male' ? '1' : '2';
    await expect(this.form.locator(`input[type="radio"][value="${genderValue}"]`)).toBeChecked();
  }

  async savePersonalDetails(): Promise<Record<string, unknown>> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        /\/api\/v2\/pim\/employees\/\d+\/personal-details$/.test(response.url()),
    );
    await this.form.getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.page.getByText('Successfully Updated')).toBeVisible();
    return response.request().postDataJSON() as Record<string, unknown>;
  }

  async clearRequiredNamesAndSave() {
    for (const name of ['firstName', 'lastName']) {
      const input = this.page.locator(`input[name="${name}"]`);
      await input.click();
      await input.press('Control+A');
      await input.press('Backspace');
      await input.press('Tab');
    }
    await this.form.getByRole('button', { name: 'Save' }).click();
  }

  async expectRequiredNameErrors() {
    await expect(
      this.form.locator('.oxd-input-field-error-message'),
    ).toHaveText(['Required', 'Required']);
  }

}
