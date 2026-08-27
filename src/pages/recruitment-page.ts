import { expect, Page } from '@playwright/test';
import { inputGroup } from './components/form-controls';

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

  get candidatesHeading() {
    return this.page.getByRole('heading', { name: 'Candidates', exact: true });
  }

  get candidateNameInput() {
    return this.page.getByPlaceholder('Type for hints...');
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  get fromDateInput() {
    return this.page.getByPlaceholder('From');
  }

  get candidateFirstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }

  get candidateLastNameInput() {
    return this.page.getByPlaceholder('Last Name');
  }

  get candidateEmailInput() {
    return inputGroup(this.page, 'Email').locator('input');
  }

  get candidateEmailValidationMessage() {
    return inputGroup(this.page, 'Email').getByText(
      'Expected format: admin@example.com',
    );
  }

  get candidateVacancyDropdown() {
    return this.page
      .locator('label', { hasText: 'Job Vacancy' })
      .locator('..')
      .locator('..')
      .locator('.oxd-select-text');
  }

  async open() {
    await this.page
      .getByRole('link', { name: 'Recruitment', exact: true })
      .click();
  }

  async searchCandidates() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/recruitment/candidates'),
    );
    await this.searchButton.click();
    return responsePromise;
  }

  async openCandidate(candidateName: string) {
    const maximumPagesToCheck = 100;
    const maximumListRefreshes = 3;

    for (let refresh = 1; refresh <= maximumListRefreshes; refresh++) {
      for (
        let checkedPages = 1;
        checkedPages <= maximumPagesToCheck;
        checkedPages++
      ) {
        const candidateRow = this.page
          .getByRole('row')
          .filter({ hasText: candidateName });

        if ((await candidateRow.count()) > 0) {
          await candidateRow.locator('button:has(.bi-eye-fill)').click();
          await expect(this.candidateProfileHeading).toBeVisible({
            timeout: 15_000,
          });
          return;
        }

        const pagination = this.page.getByRole('navigation', {
          name: 'Pagination Navigation',
        });
        if ((await pagination.count()) === 0) break;

        const nextPageButton = pagination.getByRole('button').last();
        if (await nextPageButton.isDisabled()) break;

        const responsePromise = this.page.waitForResponse(
          (response) =>
            response.request().method() === 'GET' &&
            response.url().includes('/api/v2/recruitment/candidates'),
        );
        await nextPageButton.click();
        await responsePromise;
      }

      if (refresh < maximumListRefreshes) {
        await this.searchCandidates();
      }
    }

    throw new Error(`Candidate "${candidateName}" was not found on any page`);
  }

  async shortlistCandidate(note: string) {
    await this.page.getByRole('button', { name: 'Shortlist' }).click();
    await this.page.locator('textarea').fill(note);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async openAddCandidatePage() {
    await this.open();
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async openAddVacancyPage() {
    await this.open();
    await this.page
      .getByRole('navigation', { name: 'Topbar Menu' })
      .getByRole('link', { name: 'Vacancies', exact: true })
      .click();
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async cancelCandidateCreation() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  private async selectDropdownOption(
    dropdownIndex: number,
    optionName?: string,
  ) {
    const dropdown = this.page.locator('.oxd-select-text').nth(dropdownIndex);
    await dropdown.click();
    const option = optionName
      ? this.page.getByRole('option', { name: optionName, exact: true })
      : this.page
          .getByRole('option')
          .filter({ hasNotText: '-- Select --' })
          .first();
    await option.click();
    await expect(dropdown).not.toContainText('-- Select --');
  }

  async fillCandidateForm(firstName: string, lastName: string, email: string) {
    await this.candidateFirstNameInput.fill(firstName);
    await this.candidateLastNameInput.fill(lastName);
    await this.candidateEmailInput.fill(email);
  }

  async addCandidate(
    firstName: string,
    lastName: string,
    email: string,
    vacancyName?: string,
  ) {
    await this.fillCandidateForm(firstName, lastName, email);
    await this.selectDropdownOption(0, vacancyName);
    await this.submitForm();
  }
}
