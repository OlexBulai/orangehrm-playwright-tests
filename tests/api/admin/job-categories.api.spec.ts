import { expect, test } from '../../fixtures/admin/job-categories.fixture';
import { createJobCategory } from '../../helpers/admin/job-categories-test-helpers';

test.describe('Job Categories API', { tag: '@mutation' }, () => {
  test('supports the Job Category CRUD lifecycle', async ({
    createJobCategoryThroughApi,
    jobCategoriesApi,
    jobCategoryCleanup,
  }) => {
    const original = createJobCategory('api-original');
    const updated = createJobCategory('api-updated');
    const id = await createJobCategoryThroughApi(original);

    expect(await jobCategoriesApi.getJobCategoryIdByName(original.name)).toBe(
      id,
    );
    await jobCategoriesApi.updateJobCategory(id, updated);
    expect(await jobCategoriesApi.getJobCategoryIdByName(updated.name)).toBe(
      id,
    );

    await jobCategoriesApi.deleteJobCategories([id]);
    jobCategoryCleanup.forget(id);
    expect(
      (await jobCategoriesApi.getJobCategories()).some((x) => x.id === id),
    ).toBe(false);
  });

  test('rejects an empty Job Category name', async ({ jobCategoriesApi }) => {
    const response = await jobCategoriesApi.createJobCategoryResponse({
      name: '',
    });
    expect(response.status()).toBe(422);
  });
});
