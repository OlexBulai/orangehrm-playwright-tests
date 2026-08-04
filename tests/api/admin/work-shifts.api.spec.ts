import { expect, test } from '../../fixtures/admin/work-shifts.fixture';
import { createWorkShift } from '../../helpers/admin/work-shifts-test-helpers';

test.describe('Work Shifts API', { tag: '@mutation' }, () => {
  test('supports the Work Shift CRUD lifecycle', async ({
    createWorkShiftThroughApi,
    workShiftCleanup,
    workShiftsApi,
  }) => {
    const original = createWorkShift('api-original');
    const updated = createWorkShift('api-updated');
    const id = await createWorkShiftThroughApi(original);

    expect(await workShiftsApi.getWorkShiftIdByName(original.name)).toBe(id);
    await workShiftsApi.updateWorkShift(id, updated);
    expect(await workShiftsApi.getWorkShiftIdByName(updated.name)).toBe(id);

    await workShiftsApi.deleteWorkShifts([id]);
    workShiftCleanup.forget(id);
    expect((await workShiftsApi.getWorkShifts()).some((x) => x.id === id)).toBe(
      false,
    );
  });

  test('rejects an empty Work Shift name', async ({ workShiftsApi }) => {
    const response = await workShiftsApi.createWorkShiftResponse({
      ...createWorkShift('api-invalid'),
      name: '',
    });
    expect(response.status()).toBe(422);
  });
});
