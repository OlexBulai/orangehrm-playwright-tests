import { test, expect } from '../fixtures/admin/job-categories.fixture';
import { createJobCategory } from '../helpers/admin/job-categories-test-helpers';

test.describe('OrangeHRM Admin Job Categories tests', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ jobCategories }) => {
    await jobCategories.openJobCategories();
  });

  test('Admin can open Job Categories', async ({ page, jobCategories }) => {
    await expect(page).toHaveURL(/admin\/jobCategory/);
    await expect(jobCategories.heading).toBeVisible();
  });

  test('Job Categories table has expected columns', async ({
    jobCategories,
  }) => {
    await jobCategories.expectColumns();
  });

  test('Job Categories table matches API data', async ({
    jobCategories,
    jobCategoriesApi,
  }) => {
    await jobCategories.expectRecords(
      await jobCategoriesApi.getJobCategories(),
    );
  });

  test.describe('Job Category mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can add a Job Category', async ({
      jobCategories,
      jobCategoriesApi,
      jobCategoryCleanup,
    }) => {
      const data = createJobCategory();
      await jobCategories.addJobCategory(data);
      const id = await jobCategoriesApi.getJobCategoryIdByName(data.name);
      jobCategoryCleanup.track(id);
      await jobCategories.openJobCategories();
      await jobCategories.expectJobCategory(data);
    });

    test('Admin can edit a Job Category', async ({
      page,
      jobCategories,
      createJobCategoryThroughApi,
    }) => {
      const original = createJobCategory('original');
      await createJobCategoryThroughApi(original);
      await page.reload();
      const updated = createJobCategory('updated');
      await jobCategories.editJobCategory(original.name, updated);
      await jobCategories.openJobCategories();
      await jobCategories.expectJobCategory(updated);
    });

    test('Admin can delete a Job Category', async ({
      page,
      jobCategories,
      createJobCategoryThroughApi,
      jobCategoryCleanup,
    }) => {
      const data = createJobCategory('delete');
      const id = await createJobCategoryThroughApi(data);
      await page.reload();
      await jobCategories.deleteJobCategory(data.name);
      jobCategoryCleanup.forget(id);
    });

    test('Job Category name is required', async ({ jobCategories }) => {
      await jobCategories.expectRequiredNameValidation();
    });
  });
});
