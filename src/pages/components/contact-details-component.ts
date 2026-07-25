import { expect, Locator, Page } from '@playwright/test';
import { exactLabel, inputGroup } from './form-controls';

export type ContactDetailsData = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  homePhone: string;
  mobile: string;
  workPhone: string;
  workEmail: string;
  otherEmail: string;
};

export default class ContactDetailsComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Contact Details' });
    this.form = page.locator('form').filter({
      has: exactLabel(page, 'Street 1'),
    });
  }

  private input(label: string): Locator {
    return inputGroup(this.page, label).locator('input');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async read(): Promise<ContactDetailsData> {
    return {
      street1: await this.input('Street 1').inputValue(),
      street2: await this.input('Street 2').inputValue(),
      city: await this.input('City').inputValue(),
      state: await this.input('State/Province').inputValue(),
      zipCode: await this.input('Zip/Postal Code').inputValue(),
      country: await this.countryValue(),
      homePhone: await this.input('Home').inputValue(),
      mobile: await this.input('Mobile').inputValue(),
      workPhone: await this.input('Work').inputValue(),
      workEmail: await this.input('Work Email').inputValue(),
      otherEmail: await this.input('Other Email').inputValue(),
    };
  }

  async fill(data: ContactDetailsData) {
    await this.input('Street 1').fill(data.street1);
    await this.input('Street 2').fill(data.street2);
    await this.input('City').fill(data.city);
    await this.input('State/Province').fill(data.state);
    await this.input('Zip/Postal Code').fill(data.zipCode);
    await this.selectCountry(data.country);
    await this.input('Home').fill(data.homePhone);
    await this.input('Mobile').fill(data.mobile);
    await this.input('Work').fill(data.workPhone);
    await this.input('Work Email').fill(data.workEmail);
    await this.input('Other Email').fill(data.otherEmail);
  }

  async saveContactDetails(): Promise<Record<string, string | null>> {
    const saveButton = this.form.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        /\/api\/v2\/pim\/employee\/\d+\/contact-details$/.test(
          response.url(),
        ),
    );
    await saveButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.page.getByText('Successfully Updated')).toBeVisible();
    const body = (await response.json()) as {
      data: Record<string, string | null>;
    };
    return body.data;
  }

  async update(data: ContactDetailsData) {
    await this.fill(data);
    return this.saveContactDetails();
  }

  async expectValues(data: ContactDetailsData) {
    await expect(this.input('Street 1')).toHaveValue(data.street1);
    await expect(this.input('Street 2')).toHaveValue(data.street2);
    await expect(this.input('City')).toHaveValue(data.city);
    await expect(this.input('State/Province')).toHaveValue(data.state);
    await expect(this.input('Zip/Postal Code')).toHaveValue(data.zipCode);
    await expect(this.countrySelect()).toContainText(data.country);
    await expect(this.input('Home')).toHaveValue(data.homePhone);
    await expect(this.input('Mobile')).toHaveValue(data.mobile);
    await expect(this.input('Work')).toHaveValue(data.workPhone);
    await expect(this.input('Work Email')).toHaveValue(data.workEmail);
    await expect(this.input('Other Email')).toHaveValue(data.otherEmail);
  }

  async fillWorkEmail(value: string) {
    await this.input('Work Email').fill(value);
    await this.input('Work Email').blur();
  }

  async expectWorkEmailValidation(message: string) {
    const group = this.page
      .locator('.oxd-input-group')
      .filter({ has: exactLabel(this.page, 'Work Email') });
    await expect(group.getByText(message)).toBeVisible();
  }

  private countrySelect(): Locator {
    return inputGroup(this.page, 'Country').locator('.oxd-select-text');
  }

  private async countryValue(): Promise<string> {
    const value = (await this.countrySelect().textContent())?.trim();
    return value === '-- Select --' ? '' : (value ?? '');
  }

  private async selectCountry(country: string) {
    await this.countrySelect().click();
    const optionName = country || '-- Select --';
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
  }
}
