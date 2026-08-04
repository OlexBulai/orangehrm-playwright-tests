import { test, expect } from '../fixtures/admin/employment-status.fixture';
import { createEmploymentStatus } from '../helpers/admin/employment-status-test-helpers';

test.describe('OrangeHRM Admin Employment Status tests', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ employmentStatus }) => {
    await employmentStatus.openEmploymentStatus();
  });

  test('Admin can open Employment Status', async ({
    page,
    employmentStatus,
  }) => {
    await expect(page).toHaveURL(/admin\/employmentStatus/);
    await expect(employmentStatus.heading).toBeVisible();
  });

  test('Employment Status table has expected columns', async ({
    employmentStatus,
  }) => {
    await employmentStatus.expectColumns();
  });

  test('Employment Status table matches API data', async ({
    employmentStatus,
    employmentStatusApi,
  }) => {
    await employmentStatus.expectRecords(
      await employmentStatusApi.getEmploymentStatuses(),
    );
  });

  test.describe('Employment Status mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can add an Employment Status', async ({
      employmentStatus,
      employmentStatusApi,
      employmentStatusCleanup,
    }) => {
      const data = createEmploymentStatus();
      await employmentStatus.addEmploymentStatus(data);
      const id = await employmentStatusApi.getEmploymentStatusIdByName(
        data.name,
      );
      employmentStatusCleanup.track(id);
      await employmentStatus.openEmploymentStatus();
      await employmentStatus.expectEmploymentStatus(data);
    });

    test('Employment Status name is required', async ({ employmentStatus }) => {
      await employmentStatus.expectRequiredNameValidation();
    });
  });
});
