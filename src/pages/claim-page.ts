import { expect, Page } from '@playwright/test';
import {
  inputGroup,
  selectDropdownOption,
  selectFirstAutocompleteOption,
  selectFirstDropdownOption,
} from './components/form-controls';

export default class ClaimPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', {
      name: 'Employee Claims',
      exact: true,
    });
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  get requiredMessages() {
    return this.page.locator('.oxd-input-field-error-message');
  }

  get assignClaimHeading() {
    return this.page.getByRole('heading', { name: 'Create Claim Request' });
  }

  get eventNameSelect() {
    return inputGroup(this.page, 'Event Name').locator('.oxd-select-text');
  }

  get statusSelect() {
    return inputGroup(this.page, 'Status').locator('.oxd-select-text');
  }

  get includeSelect() {
    return inputGroup(this.page, 'Include').locator('.oxd-select-text');
  }

  get claimRows() {
    return this.page.locator('.oxd-table-body .oxd-table-card');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Claim', exact: true }).click();
    await expect(this.page).toHaveURL(/claim\/viewAssignClaim/);
    await expect(this.heading).toBeVisible();
  }

  async search() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/claim/'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async openAssignClaimForm() {
    await this.page.getByRole('button', { name: 'Assign Claim' }).click();
    await expect(this.assignClaimHeading).toBeVisible();
  }

  async submitEmptyClaimForm() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async selectStatus(status: string) {
    await selectDropdownOption(this.page, this.statusSelect, status);
  }

  async selectEvent() {
    return selectFirstDropdownOption(this.page, this.eventNameSelect);
  }

  async fillAssignClaimForm(remarks: string) {
    const employeeInput = inputGroup(
      this.page,
      'Employee Name',
    ).getByPlaceholder('Type for hints...');
    const employeeName = await selectFirstAutocompleteOption(
      this.page,
      employeeInput,
    );
    await selectFirstDropdownOption(
      this.page,
      inputGroup(this.page, 'Event').locator('.oxd-select-text'),
    );
    await selectDropdownOption(
      this.page,
      inputGroup(this.page, 'Currency').locator('.oxd-select-text'),
      'Euro',
    );
    await inputGroup(this.page, 'Remarks').locator('textarea').fill(remarks);
    return employeeName;
  }

  async cancelAssignClaim() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}
