import { test, expect } from '../fixtures/my-info/qualifications.fixture';
import {
  createWorkExperience,
  testLanguage,
} from '../helpers/my-info/qualifications-test-helpers';

test.describe('My Info Qualifications tests', () => {
  test.beforeEach(async ({ myInfoPage }) => {
    await myInfoPage.openQualifications();
  });

  test('User can open all Qualifications sections', async ({
    page,
    myInfoPage,
  }) => {
    await expect(page).toHaveURL(/viewQualifications\/empNumber\/\d+/);
    await myInfoPage.qualifications.expectVisible();
  });

  test.describe('Qualifications mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo employee must not be updated concurrently.',
    );

    test('User can add Work Experience', async ({
      myInfoPage,
      qualificationsCleanup,
    }) => {
      const work = createWorkExperience();
      const id = await myInfoPage.qualifications.addWorkExperience(work);
      qualificationsCleanup.trackWork(id);
    });

    test('User can edit Work Experience', async ({
      page,
      myInfoPage,
      qualificationsApi,
      qualificationsCleanup,
      employeeId,
    }) => {
      const original = createWorkExperience('original');
      const id = await qualificationsApi.createWorkExperience(
        employeeId,
        original,
      );
      qualificationsCleanup.trackWork(id);
      await page.reload();
      const updated = {
        ...createWorkExperience('updated'),
        company: original.company,
        jobTitle: 'Senior QA',
      };

      await myInfoPage.qualifications.editWorkExperience(
        original.company,
        updated,
      );
    });

    test('User can delete Work Experience', async ({
      page,
      myInfoPage,
      qualificationsApi,
      qualificationsCleanup,
      employeeId,
    }) => {
      const work = createWorkExperience('delete');
      const id = await qualificationsApi.createWorkExperience(employeeId, work);
      qualificationsCleanup.trackWork(id);
      await page.reload();

      await myInfoPage.qualifications.deleteWorkExperience(work.company);
      qualificationsCleanup.forgetWork(id);
    });

    test('User can add Language', async ({
      myInfoPage,
      qualificationsCleanup,
    }) => {
      const id = await myInfoPage.qualifications.addLanguage(testLanguage);
      qualificationsCleanup.trackLanguage(id);
    });

    test('User can delete Language', async ({
      page,
      myInfoPage,
      qualificationsApi,
      qualificationsCleanup,
      employeeId,
    }) => {
      const id = {
        languageId: testLanguage.languageId,
        fluencyId: testLanguage.fluencyId,
      };
      await qualificationsApi.createLanguage(employeeId, testLanguage);
      qualificationsCleanup.trackLanguage(id);
      await page.reload();

      await myInfoPage.qualifications.deleteLanguage(
        testLanguage.language,
        testLanguage.fluency,
      );
      qualificationsCleanup.forgetLanguage(id);
    });
  });

  test('Qualifications tables match API data', async ({
    myInfoPage,
    qualificationsApi,
    employeeId,
  }) => {
    const lists = await qualificationsApi.getLists(employeeId);

    await myInfoPage.qualifications.expectRows(
      'Work Experience',
      lists.workExperiences.map((item) => [item.company, item.jobTitle]),
    );
    await myInfoPage.qualifications.expectRows(
      'Education',
      lists.educations.map((item) => [item.education.name]),
    );
    await myInfoPage.qualifications.expectRows(
      'Skills',
      lists.skills.map((item) => [
        item.skill.name,
        String(item.yearsOfExperience),
      ]),
    );
    await myInfoPage.qualifications.expectRows(
      'Languages',
      lists.languages.map((item) => [
        item.language.name,
        item.fluency.name,
        item.competency.name,
      ]),
    );
    await myInfoPage.qualifications.expectRows(
      'License',
      lists.licenses.map((item) => [item.license.name, item.licenseNo]),
    );
  });

  test('Qualifications custom fields API is available', async ({
    qualificationsApi,
    employeeId,
  }) => {
    const total = await qualificationsApi.getCustomFieldCount(employeeId);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('Qualifications attachment count matches API data', async ({
    myInfoPage,
    attachmentApi,
    employeeId,
  }) => {
    const total = await attachmentApi.getCount(employeeId, 'qualifications');
    await myInfoPage.attachments.expectCount(total);
  });
});
