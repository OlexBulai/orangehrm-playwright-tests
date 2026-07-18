import { Page } from '@playwright/test';

export default class RecruitmentPage {
  constructor(private readonly page: Page) {}

  get addCandidateHeading() {
    return this.page.getByRole('heading', { name: 'Add Candidate' });
  }

  get candidateProfileHeading() {
    return this.page.getByRole('heading', { name: 'Candidate Profile' });
  }

  get requiredMessages() {
    return this.page.getByText('Required');
  }

  async open() {
    await this.page.getByRole('link', { name: 'Recruitment' }).click();
  }

  async openAddCandidatePage() {
    await this.open();
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  private async selectFirstDropdownOption(dropdownIndex: number) {
    await this.page.locator('.oxd-select-text').nth(dropdownIndex).click();
    await this.page
      .getByRole('option')
      .filter({ hasNotText: '-- Select --' })
      .first()
      .click();
  }

  async fillCandidateForm(firstName: string, lastName: string, email: string) {
    await this.page.getByPlaceholder('First Name').fill(firstName);
    await this.page.getByPlaceholder('Last Name').fill(lastName);

    await this.page
      .locator('label', { hasText: 'Email' })
      .locator('..')
      .locator('..')
      .locator('input')
      .fill(email);
  }

  async addCandidate(
    firstName: string,
    lastName: string,
    email: string,
  ) {
    await this.fillCandidateForm(firstName, lastName, email);
    await this.selectFirstDropdownOption(0);
    await this.submitForm();
  }
}
