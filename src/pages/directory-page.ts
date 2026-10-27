import { Page } from '@playwright/test';

export default class DirectoryPage {
  constructor(protected readonly page: Page) {}

  get directoryHeading() {
    return this.page.getByRole('heading', {
      name: 'Directory',
      exact: true,
      level: 6,
    });
  }
  get employeeNameInput() {
    return this.page.getByPlaceholder('Type for hints...');
  }
  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }
  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }
  get jobTitleSelect() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Job Title' })
      .locator('.oxd-select-text');
  }
  async open() {
    await this.page.getByRole('link', { name: 'Directory' }).click();
  }
  async fillEmployeeName(employeeName: string) {
    await this.employeeNameInput.fill(employeeName);
    await this.employeeNameInput.blur();
  }
  async selectFirstJobTitle() {
    await this.jobTitleSelect.click();
    await this.page
      .getByRole('option')
      .filter({ hasNotText: '-- Select --' })
      .first()
      .click();
  }
  async search() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/directory/employees'),
    );
    await this.searchButton.click();
    return responsePromise;
  }
}
