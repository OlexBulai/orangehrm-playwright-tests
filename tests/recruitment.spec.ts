import { test, expect } from './fixtures/shared/authenticated.fixture';
import { faker } from '@faker-js/faker';
import RecruitmentPage from '../src/pages/recruitment-page';
import JobTitlesApi from '../src/pages/api/job-titles-api';
import PimApi from '../src/pages/api/pim-api';
import RecruitmentApi from '../src/pages/api/recruitment-api';
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

  test('Admin cannot create vacancy without required fields', async ({
    page,
  }) => {
    await recruitmentPage.openAddVacancyPage();
    await expect(
      page.getByRole('heading', { name: 'Add Vacancy' }),
    ).toBeVisible();

    await recruitmentPage.submitForm();

    await expect(recruitmentPage.requiredMessages).not.toHaveCount(0);
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

      await expect(page).toHaveURL(/recruitment\/addCandidate\/\d+/);
      await expect(recruitmentPage.candidateProfileHeading).toBeVisible({
        timeout: 15_000,
      });
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

  test(
    'Admin can shortlist a newly created candidate',
    { tag: '@mutation' },
    async ({ page }, testInfo) => {
      test.setTimeout(180_000);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName });
      const vacancyName = `QA Vacancy ${faker.string.alphanumeric(8)}`;
      const jobTitleName = `QA Job ${faker.string.alphanumeric(8)}`;
      const managerFirstName = `Manager${faker.string.alpha(6)}`;
      const managerLastName = faker.person.lastName();
      const shortlistNote = 'Candidate meets the shortlist requirements.';
      let candidateId: number | undefined;
      let vacancyId: number | undefined;
      let jobTitleId: number | undefined;
      let managerEmployeeNumber: number | undefined;

      try {
        const recruitmentApi = new RecruitmentApi(page.request);
        const pimApi = new PimApi(page.request);
        managerEmployeeNumber = await pimApi.createEmployee({
          firstName: managerFirstName,
          middleName: '',
          lastName: managerLastName,
          employeeId: faker.string.numeric(8),
        });

        const jobTitlesApi = new JobTitlesApi(page.request);
        jobTitleId = await jobTitlesApi.createJobTitle({
          title: jobTitleName,
          description: 'Job title for the recruitment shortlist test',
          note: '',
        });

        vacancyId = await recruitmentApi.createVacancy({
          name: vacancyName,
          jobTitleId,
          employeeId: managerEmployeeNumber,
        });
        candidateId = await recruitmentApi.createCandidate({
          firstName,
          lastName,
          email,
          vacancyId,
        });

        await recruitmentPage.open();
        await recruitmentPage.openCandidate(fullName);
        await expect(recruitmentPage.candidateProfileHeading).toBeVisible();
        await expect(recruitmentPage.candidateFirstNameInput).toHaveValue(
          firstName,
        );
        await expect(recruitmentPage.candidateLastNameInput).toHaveValue(
          lastName,
        );
        await expect(recruitmentPage.candidateEmailInput).toHaveValue(email);
        await expect(recruitmentPage.candidateVacancyDropdown).toContainText(
          vacancyName,
        );

        await recruitmentPage.shortlistCandidate(shortlistNote);

        await expect(page.getByText('Status: Shortlisted')).toBeVisible();
      } finally {
        testInfo.setTimeout(testInfo.timeout + 30_000);
        if (candidateId !== undefined) {
          const recruitmentApi = new RecruitmentApi(page.request);
          await recruitmentApi.deleteCandidates([candidateId]);
        }
        if (vacancyId !== undefined) {
          const recruitmentApi = new RecruitmentApi(page.request);
          await recruitmentApi.deleteVacancies([vacancyId]);
        }
        if (jobTitleId !== undefined) {
          const jobTitlesApi = new JobTitlesApi(page.request);
          await jobTitlesApi.deleteJobTitles([jobTitleId]);
        }
        if (managerEmployeeNumber !== undefined) {
          const pimApi = new PimApi(page.request);
          await pimApi.deleteEmployees([managerEmployeeNumber]);
        }
      }
    },
  );
});
