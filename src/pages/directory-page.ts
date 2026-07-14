import { Page } from '@playwright/test';

export default class DirectoryPage {
  constructor(protected readonly page: Page) {}

  get directoryHeading() {
    return this.page.getByRole('heading', { name: 'Directory' });
  }
  async open() {
    await this.page.getByRole('link', { name: 'Directory' }).click();
  }
  async fillEmployeeName(employeeName: string) {
    const employeeInput = this.page.getByPlaceholder('Type for hints...');
    await employeeInput.fill(employeeName);
  }
}
