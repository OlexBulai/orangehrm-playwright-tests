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
  async open() {
    await this.page.getByRole('link', { name: 'Directory' }).click();
  }
  async fillEmployeeName(employeeName: string) {
    await this.employeeNameInput.fill(employeeName);
  }
}
