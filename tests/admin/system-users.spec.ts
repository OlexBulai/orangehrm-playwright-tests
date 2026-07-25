import { test, expect } from '../fixtures/admin/system-users.fixture';
import {
  createSystemUsername,
  systemUserPassword,
} from '../helpers/admin/system-users-test-helpers';

test.describe('OrangeHRM Admin System Users tests', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.openAdminPage();
  });

  test('Admin can open System Users', async ({ page, adminPage }) => {
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(adminPage.heading).toBeVisible();
  });

  test('Admin can reset System Users filters', async ({ adminPage }) => {
    await adminPage.searchSystemUser('temporary-filter');
    await adminPage.resetSearchFilters();
  });

  test.describe('System User mutations', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can find a user created through API', async ({
      page,
      adminPage,
      adminSetup,
    }) => {
      const prepared = await adminSetup.createSystemUser();
      await page.reload();
      await adminPage.searchSystemUser(prepared.user.username);
      await adminPage.expectSystemUser({
        username: prepared.user.username,
        role: prepared.user.role,
        employeeName: prepared.employee.fullName,
        status: prepared.user.status,
      });
    });

    test('Admin can add a System User through UI', async ({
      adminPage,
      adminSetup,
      adminCleanup,
    }) => {
      const employee = await adminSetup.createEmployee();
      const username = createSystemUsername();
      const id = await adminPage.addSystemUser({
        username,
        password: systemUserPassword,
        role: 'ESS',
        roleId: 2,
        status: 'Enabled',
        employeeNumber: employee.number,
        employeeName: employee.fullName,
      });
      adminCleanup.trackUser(id);

      await adminPage.openAdminPage();
      await adminPage.searchSystemUser(username);
      await adminPage.expectSystemUser({
        username,
        role: 'ESS',
        employeeName: employee.fullName,
        status: 'Enabled',
      });
    });

    test('Admin can edit a System User status', async ({
      page,
      adminPage,
      adminSetup,
    }, testInfo) => {
      testInfo.setTimeout(90_000);
      const prepared = await adminSetup.createSystemUser();
      await page.reload();
      await adminPage.searchSystemUser(prepared.user.username);
      await adminPage.editSystemUserStatus(prepared.user.username, 'Disabled');
      await adminPage.searchSystemUser(prepared.user.username);
      await adminPage.expectSystemUser({
        username: prepared.user.username,
        role: prepared.user.role,
        employeeName: prepared.employee.fullName,
        status: 'Disabled',
      });
    });

    test('Admin can delete a System User', async ({
      page,
      adminPage,
      adminSetup,
      adminCleanup,
    }, testInfo) => {
      testInfo.setTimeout(60_000);
      const prepared = await adminSetup.createSystemUser();
      await page.reload();
      await adminPage.searchSystemUser(prepared.user.username);
      await adminPage.deleteSystemUser(prepared.user.username);
      adminCleanup.forgetUser(prepared.id);
    });
  });
});
