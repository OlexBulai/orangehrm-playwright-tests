import { expect, test } from '../../fixtures/admin/job-titles.fixture';
import { createJobTitle } from '../../helpers/admin/job-titles-test-helpers';

test.describe('Job Titles API', { tag: '@mutation' }, () => {
  test.describe.configure({ mode: 'serial' });

  test('supports the Job Title CRUD lifecycle', async ({
    createJobTitleThroughApi,
    jobTitleCleanup,
    jobTitlesApi,
  }) => {
    const original = createJobTitle('api-original');
    const updated = createJobTitle('api-updated');

    const id = await createJobTitleThroughApi(original);

    await expect
      .poll(async () =>
        (await jobTitlesApi.getJobTitles()).find((x) => x.id === id),
      )
      .toMatchObject(original);

    await jobTitlesApi.updateJobTitle(id, updated);

    await expect
      .poll(async () =>
        (await jobTitlesApi.getJobTitles()).find((x) => x.id === id),
      )
      .toMatchObject(updated);

    await jobTitlesApi.deleteJobTitles([id]);
    jobTitleCleanup.forget(id);

    await expect
      .poll(async () =>
        (await jobTitlesApi.getJobTitles()).some((x) => x.id === id),
      )
      .toBe(false);
  });

  test('rejects an empty title', async ({ jobTitlesApi }) => {
    const response = await jobTitlesApi.createJobTitleResponse({
      title: '',
      description: '',
      note: '',
    });

    expect(response.status()).toBe(422);
  });
});
