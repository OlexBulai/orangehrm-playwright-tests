import { test, expect } from '../fixtures/admin/work-shifts.fixture';
import { createWorkShift } from '../helpers/admin/work-shifts-test-helpers';

test.describe('OrangeHRM Admin Work Shifts tests', () => {
  test.describe.configure({ timeout: 90_000 });
  test.beforeEach(async ({ workShifts }) => {
    await workShifts.openWorkShifts();
  });

  test('Admin can open Work Shifts', async ({ page, workShifts }) => {
    await expect(page).toHaveURL(/admin\/workShift/);
    await expect(workShifts.heading).toBeVisible();
  });

  test('Work Shifts table has expected columns', async ({ workShifts }) => {
    await workShifts.expectColumns();
  });

  test('Work Shifts table matches API data', async ({
    workShifts,
    workShiftsApi,
  }) => {
    await workShifts.expectRecords(await workShiftsApi.getWorkShifts());
  });

  test.describe('Work Shift mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can add a Work Shift', async ({
      workShifts,
      workShiftsApi,
      workShiftCleanup,
    }) => {
      const data = createWorkShift();
      await workShifts.addWorkShift(data);
      const id = await workShiftsApi.getWorkShiftIdByName(data.name);
      workShiftCleanup.track(id);
      await workShifts.openWorkShifts();
      await workShifts.expectWorkShift(data);
    });

    test('Admin can edit a Work Shift', async ({
      page,
      workShifts,
      createWorkShiftThroughApi,
    }) => {
      const original = createWorkShift('original');
      await createWorkShiftThroughApi(original);
      await page.reload();
      const updated = createWorkShift('updated');
      await workShifts.editWorkShift(original.name, updated);
      await workShifts.openWorkShifts();
      await workShifts.expectWorkShift(updated);
    });

    test('Admin can delete a Work Shift', async ({
      page,
      workShifts,
      createWorkShiftThroughApi,
      workShiftCleanup,
    }) => {
      const data = createWorkShift('delete');
      const id = await createWorkShiftThroughApi(data);
      await page.reload();
      await workShifts.deleteWorkShift(data.name);
      workShiftCleanup.forget(id);
    });

    test('Work Shift name is required', async ({ workShifts }) => {
      await workShifts.expectRequiredNameValidation();
    });
  });
});
