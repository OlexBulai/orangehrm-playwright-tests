import { test, expect } from '../fixtures/admin/job-titles.fixture';
import { createJobTitle } from '../helpers/admin/job-titles-test-helpers';

test.describe('OrangeHRM Admin Job Titles tests', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ jobTitles }) => {
    await jobTitles.openJobTitles();
  });

  test('Admin can open Job Titles', async ({ page, jobTitles }) => {
    await expect(page).toHaveURL(/admin\/viewJobTitleList/);
    await expect(jobTitles.heading).toBeVisible();
  });

  test('Job Titles table has expected columns', async ({ jobTitles }) => {
    await jobTitles.expectColumns();
  });

  test('Job Titles table matches API data', async ({
    jobTitles,
    jobTitlesApi,
  }) => {
    await jobTitles.expectRecords(await jobTitlesApi.getJobTitles());
  });

  test.describe('Job Title mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can add a Job Title', async ({
      jobTitles,
      jobTitleCleanup,
    }, testInfo) => {
      testInfo.setTimeout(90_000);
      const data = createJobTitle();
      const id = await jobTitles.addJobTitle(data);
      jobTitleCleanup.track(id);
      await jobTitles.openJobTitles();
      await jobTitles.expectJobTitle(data);
    });

    test('Admin can edit and delete a Job Title', async ({
      page,
      jobTitles,
      jobTitleCleanup,
      createJobTitleThroughApi,
    }) => {
      const original = createJobTitle('ui-original');
      const updated = createJobTitle('ui-updated');
      const id = await createJobTitleThroughApi(original);
      await page.reload();

      await jobTitles.editJobTitle(original.title, updated);
      await jobTitles.expectJobTitle(updated);
      await jobTitles.deleteJobTitle(updated.title);
      jobTitleCleanup.forget(id);
    });

    test('Job Title is required', async ({ jobTitles }) => {
      await jobTitles.expectRequiredTitleValidation();
    });
  });
});
