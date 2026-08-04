import { expect, test } from '../../fixtures/admin/employment-status.fixture';
import { createEmploymentStatus } from '../../helpers/admin/employment-status-test-helpers';

test.describe('Employment Status API', { tag: '@mutation' }, () => {
  test('supports the Employment Status CRUD lifecycle', async ({
    createEmploymentStatusThroughApi,
    employmentStatusApi,
    employmentStatusCleanup,
  }) => {
    const original = createEmploymentStatus('api-original');
    const updated = createEmploymentStatus('api-updated');
    const id = await createEmploymentStatusThroughApi(original);

    expect(
      await employmentStatusApi.getEmploymentStatusIdByName(original.name),
    ).toBe(id);
    await employmentStatusApi.updateEmploymentStatus(id, updated);
    expect(
      await employmentStatusApi.getEmploymentStatusIdByName(updated.name),
    ).toBe(id);

    await employmentStatusApi.deleteEmploymentStatuses([id]);
    employmentStatusCleanup.forget(id);
    expect(
      (await employmentStatusApi.getEmploymentStatuses()).some(
        (x) => x.id === id,
      ),
    ).toBe(false);
  });

  test('rejects an empty Employment Status name', async ({
    employmentStatusApi,
  }) => {
    const response = await employmentStatusApi.createEmploymentStatusResponse({
      name: '',
    });
    expect(response.status()).toBe(422);
  });
});
