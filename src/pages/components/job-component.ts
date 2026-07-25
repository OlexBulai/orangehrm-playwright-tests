import { expect, Locator, Page } from '@playwright/test';
import { inputGroup } from './form-controls';

export type JobDetails = {
  joinedDate: string | null;
  jobTitle: { id: number; title: string } | null;
  empStatus: { id: number; name: string } | null;
  jobCategory: { id: number; name: string } | null;
  subunit: { id: number; name: string } | null;
  location: { id: number; name: string } | null;
};

function toUiDate(apiDate: string | null): string {
  if (apiDate === null || apiDate === '') return '';
  const [year, month, day] = apiDate.split('-');
  return `${year}-${day}-${month}`;
}

export default class JobComponent {
  readonly heading: Locator;
  readonly attachmentsHeading: Locator;
  readonly contractSwitch: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Job Details' });
    this.attachmentsHeading = page.getByRole('heading', { name: 'Attachments' });
    this.contractSwitch = page.locator('.oxd-switch-input');
  }

  private field(label: string): Locator {
    return inputGroup(this.page, label);
  }

  private contractInput(label: string): Locator {
    return this.field(label).locator('input');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.attachmentsHeading).toBeVisible();
  }

  async expectDetails(details: JobDetails) {
    await expect(this.field('Joined Date').locator('input')).toHaveValue(
      toUiDate(details.joinedDate),
    );

    const values = [
      ['Job Title', details.jobTitle?.title],
      ['Job Category', details.jobCategory?.name],
      ['Sub Unit', details.subunit?.name],
      ['Location', details.location?.name],
      ['Employment Status', details.empStatus?.name],
    ] as const;

    for (const [label, value] of values) {
      await expect(this.field(label)).toContainText(value ?? '-- Select --');
    }
  }

  async expectJobDetailsReadOnly() {
    await expect(this.field('Joined Date').locator('input')).toBeDisabled();
    await expect(this.page.locator('.oxd-select-text--disabled')).toHaveCount(5);
  }

  async showContractDetails() {
    await this.contractSwitch.click();
    await expect(this.contractInput('Contract Start Date')).toBeVisible();
    await expect(this.contractInput('Contract End Date')).toBeVisible();
    await expect(
      this.field('Contract Details').locator('input[type="file"]'),
    ).toBeAttached();
    await expect(
      this.field('Contract Details').getByText('Browse', { exact: true }),
    ).toBeVisible();
  }

  async expectContractDetailsReadOnly() {
    await expect(this.contractInput('Contract Start Date')).toBeDisabled();
    await expect(this.contractInput('Contract End Date')).toBeDisabled();
  }

  async hideContractDetails() {
    await this.contractSwitch.click();
    await expect(this.field('Contract Start Date')).toBeHidden();
    await expect(this.field('Contract End Date')).toBeHidden();
  }

}
