import { expect, test } from '../../fixtures/admin/system-users.fixture';

test.describe('System Users API', { tag: '@mutation' }, () => {
  test('supports the System User CRUD lifecycle', async ({
    adminApi,
    adminCleanup,
    adminSetup,
  }) => {
    const prepared = await adminSetup.createSystemUser();

    await expect
      .poll(async () =>
        (await adminApi.getSystemUsers()).find(
          (user) => user.id === prepared.id,
        ),
      )
      .toMatchObject({
        userName: prepared.user.username,
        status: true,
        employee: { empNumber: prepared.employee.number },
        userRole: { displayName: prepared.user.role },
      });

    await adminApi.updateSystemUser(prepared.id, {
      ...prepared.user,
      status: 'Disabled',
    });

    await expect
      .poll(async () =>
        (await adminApi.getSystemUsers()).find(
          (user) => user.id === prepared.id,
        ),
      )
      .toMatchObject({ status: false });

    await adminApi.deleteSystemUsers([prepared.id]);
    adminCleanup.forgetUser(prepared.id);

    await expect
      .poll(async () =>
        (await adminApi.getSystemUsers()).some(
          (user) => user.id === prepared.id,
        ),
      )
      .toBe(false);
  });
});
