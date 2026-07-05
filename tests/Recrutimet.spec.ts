import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import RecruitmentPage from '../src/pages/recrutimet-page';
import LoginPage from '../src/pages/login-page';
import { usernameLogin, passwordLogin } from '../env';

test.describe('Recruitment Page', () => {
  let recruitmentPage: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();

    recruitmentPage = new RecruitmentPage(page);
  });

  test('Admin cannot create candidate without required fields', async () => {
    await recruitmentPage.openAddCandidatePage();

    await expect(recruitmentPage.addCandidateHeading).toBeVisible();

    await recruitmentPage.submitForm();

    await expect(recruitmentPage.requiredMessages).toHaveCount(4);
  });

  test('Admin can add candidate', async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    await recruitmentPage.openAddCandidatePage();

    await expect(recruitmentPage.addCandidateHeading).toBeVisible();

    await recruitmentPage.addCandidate(
      firstName,
      lastName,
      email,
      'Payroll Administrator',
    );

    await expect(recruitmentPage.candidateProfileHeading).toBeVisible();
  });
});
