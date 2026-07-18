import { test, expect } from './fixtures/my-info-job.fixture';

test.describe('My Info Job tests', () => {
  test.beforeEach(async ({ myInfoPage }) => {
    await myInfoPage.openJob();
  });

  test('User can open Job Details', async ({ page, myInfoPage }) => {
    await expect(page).toHaveURL(/viewJobDetails\/empNumber\/\d+/);
    await myInfoPage.job.expectVisible();
  });

  test('Job Details UI matches API data', async ({
    myInfoPage,
    jobApi,
    employeeId,
  }) => {
    const details = await jobApi.getDetails(employeeId);

    await myInfoPage.job.expectDetails(details);
  });

  test('Job Details fields are read-only in My Info', async ({
    myInfoPage,
  }) => {
    await myInfoPage.job.expectJobDetailsReadOnly();
  });

  test('User can view Employment Contract Details', async ({ myInfoPage }) => {
    await myInfoPage.job.showContractDetails();
    await myInfoPage.job.expectContractDetailsReadOnly();
    await myInfoPage.job.hideContractDetails();
  });

  test('Job attachment count matches API data', async ({
    myInfoPage,
    attachmentApi,
    employeeId,
  }) => {
    const total = await attachmentApi.getCount(employeeId, 'job');

    await myInfoPage.attachments.expectCount(total);
  });
});
