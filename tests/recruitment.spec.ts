import { test, expect } from './fixtures/shared/authenticated.fixture';
import { faker } from '@faker-js/faker';
import RecruitmentPage from '../src/pages/recruitment-page';
import { baseUrl } from '../env';

test.describe('Recruitment Page', () => {
  test.describe.configure({ mode: 'serial' });
  let recruitmentPage: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    recruitmentPage = new RecruitmentPage(page);
  });

  test('Admin can open Candidates list', async () => {
    await recruitmentPage.open();

    await expect(recruitmentPage.candidatesHeading).toBeVisible();
    await expect(recruitmentPage.searchButton).toBeVisible();
    await expect(recruitmentPage.resetButton).toBeVisible();
  });

  test('Admin can search Candidates without changing data', async () => {
    await recruitmentPage.open();

    expect((await recruitmentPage.searchCandidates()).ok()).toBeTruthy();
  });

  test('Admin can reset Candidate filters', async () => {
    await recruitmentPage.open();
    await recruitmentPage.fromDateInput.fill('2025-01-01');
    await expect(recruitmentPage.fromDateInput).toHaveValue('2025-01-01');

    await recruitmentPage.resetButton.click();

    await expect(recruitmentPage.fromDateInput).toHaveValue('');
  });

  test('Admin cannot create candidate without required fields', async () => {
    await recruitmentPage.openAddCandidatePage();
    await expect(recruitmentPage.addCandidateHeading).toBeVisible();
    await recruitmentPage.submitForm();
    await expect(recruitmentPage.requiredMessages).toHaveCount(4);
  });

  test('Admin can add candidate', { tag: '@mutation' }, async ({ page }) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    let candidateId: number | undefined;

    try {
      await recruitmentPage.openAddCandidatePage();
      await expect(recruitmentPage.addCandidateHeading).toBeVisible();

      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().endsWith('/api/v2/recruitment/candidates'),
      );
      await recruitmentPage.addCandidate(firstName, lastName, email);
      const createResponse = await createResponsePromise;
      expect(createResponse.status()).toBe(200);
      const body = (await createResponse.json()) as { data: { id: number } };
      candidateId = body.data.id;

      await expect(recruitmentPage.candidateProfileHeading).toBeVisible();
    } finally {
      if (candidateId !== undefined) {
        const deleteResponse = await page.request.delete(
          `${baseUrl}/api/v2/recruitment/candidates`,
          { data: { ids: [candidateId] } },
        );
        expect(deleteResponse.status()).toBe(200);
      }
    }
  });
});
