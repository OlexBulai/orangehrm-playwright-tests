import { expect, Page } from '@playwright/test';
import {
  inputGroup,
  replaceInputValue,
  selectFirstAutocompleteOption,
  selectFirstDropdownOption,
} from './components/form-controls';

export default class LeavePage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Leave List', exact: true });
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

  get assignLeaveHeading() {
    return this.page.getByRole('heading', {
      name: 'Assign Leave',
      exact: true,
    });
  }

  get employeeNameInput() {
    return inputGroup(this.page, 'Employee Name').getByPlaceholder(
      'Type for hints...',
    );
  }

  get leaveTypeSelect() {
    return inputGroup(this.page, 'Leave Type').locator('.oxd-select-text');
  }

  get fromDateInput() {
    return inputGroup(this.page, 'From Date').locator('input');
  }

  get toDateInput() {
    return inputGroup(this.page, 'To Date').locator('input');
  }

  get invalidDateMessage() {
    return this.page.getByText('To date should be after from date', {
      exact: true,
    });
  }

  get confirmationHeading() {
    return this.page.getByText('Confirm Leave Assignment', { exact: true });
  }

  get successToast() {
    return this.page.locator('.oxd-toast--success');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Leave', exact: true }).click();
    await expect(this.page).toHaveURL(/leave\/viewLeaveList/);
    await expect(this.heading).toBeVisible();
  }

  async search() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/leave/employees/leave-requests'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async openAssignLeave() {
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByRole('link', { name: 'Assign Leave', exact: true })
      .click();
    await expect(this.page).toHaveURL(/leave\/assignLeave/);
    await expect(this.assignLeaveHeading).toBeVisible();
  }

  async submitEmptyAssignLeaveForm() {
    await this.page.getByRole('button', { name: 'Assign' }).click();
  }

  async fillAssignLeaveForm(
    fromDate: string,
    toDate: string,
    comments: string,
  ) {
    const employeeName = await selectFirstAutocompleteOption(
      this.page,
      this.employeeNameInput,
    );
    await selectFirstDropdownOption(this.page, this.leaveTypeSelect);
    await replaceInputValue(this.fromDateInput, fromDate);
    await replaceInputValue(this.toDateInput, toDate);
    await inputGroup(this.page, 'Comments').locator('textarea').fill(comments);
    return employeeName;
  }

  async assignLeave() {
    await this.page.getByRole('button', { name: 'Assign' }).click();
  }

  async cancelLeaveConfirmation() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}
