import { expect, Locator, Page } from '@playwright/test';
import PersonalDetailsComponent from './components/personal-details-component';

export default class PimPage {
  readonly page: Page;
  readonly pimMenuLink: Locator;
  readonly employeeNameInput: Locator;
  readonly searchEmployeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly addButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addEmployeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly employeeListMenuLink: Locator;
  readonly personalDetails: PersonalDetailsComponent;

  constructor(page: Page) {
    this.page = page;
    this.pimMenuLink = page.getByRole('link', { name: 'PIM' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.searchEmployeeIdInput = page.locator('.oxd-input').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.addEmployeeIdInput = page.locator('.oxd-input').nth(4);
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.employeeListMenuLink = page.getByRole('link', {
      name: 'Employee List',
    });
    this.personalDetails = new PersonalDetailsComponent(page);
  }

  private employeeRow(employeeId: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: employeeId, exact: true }),
    });
  }

  async openPimPage() {
    await this.pimMenuLink.click();
  }

  async fillEmployeeName(employeeName: string) {
    await this.employeeNameInput.fill(employeeName);
  }

  async fillSearchEmployeeId(employeeId: string) {
    await this.searchEmployeeIdInput.fill(employeeId);
  }

  async clickSearchButton() {
    await this.searchButton.click();
  }
  async searchEmployees() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/pim/employees'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async clickAddButton() {
    await this.addButton.click();
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillAddEmployeeId(employeeId: string) {
    await this.addEmployeeIdInput.fill(employeeId);
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async openEmployeeList() {
    await this.employeeListMenuLink.click();
  }

  async openEmployeeDetails(employeeId: string) {
    await this.employeeRow(employeeId)
      .locator('button:has(i.bi-pencil-fill)')
      .click();
    await expect(this.page).toHaveURL(
      /pim\/viewPersonalDetails\/empNumber\/\d+/,
    );
    await this.personalDetails.expectVisible();
  }

  async expectEmployeeInList(
    employeeId: string,
    firstName: string,
    lastName: string,
  ) {
    const row = this.employeeRow(employeeId);
    await expect(row).toBeVisible();
    await expect(row).toContainText(firstName);
    await expect(row).toContainText(lastName);
  }

  async deleteEmployee(employeeId: string) {
    const row = this.employeeRow(employeeId);
    await row.locator('button:has(i.bi-trash)').click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().endsWith('/api/v2/pim/employees'),
    );
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(row).toBeHidden();
  }
}
