import { Page, Locator } from '@playwright/test';

export default class PimPage {
  readonly page: Page;
  readonly pimMenuLink: Locator;
  readonly employeeNameInput: Locator;
  readonly searchEmployeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addEmployeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly employeeListMenuLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pimMenuLink = page.getByRole('link', { name: 'PIM' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.searchEmployeeIdInput = page.locator('.oxd-input').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.addEmployeeIdInput = page.locator('.oxd-input').nth(4);
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.employeeListMenuLink = page.getByRole('link', {
      name: 'Employee List',
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
}
