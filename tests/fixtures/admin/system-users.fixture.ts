import { test as base, expect } from '../shared/authenticated.fixture';
import AdminApi, { SystemUserData } from '../../../src/pages/api/admin-api';
import AdminPage from '../../../src/pages/admin-page';
import {
  AdminEmployeeData,
  createAdminEmployee,
  createSystemUsername,
  systemUserPassword,
} from '../../helpers/admin/system-users-test-helpers';

type AdminCleanup = {
  trackUser(id: number): void;
  forgetUser(id: number): void;
  trackEmployee(id: number): void;
};

type PreparedSystemUser = {
  id: number;
  employee: AdminEmployeeData & { number: number; fullName: string };
  user: SystemUserData;
};

type AdminSetup = {
  createEmployee(): Promise<PreparedSystemUser['employee']>;
  createSystemUser(): Promise<PreparedSystemUser>;
};

export const test = base.extend<{
  adminPage: AdminPage;
  adminApi: AdminApi;
  adminCleanup: AdminCleanup;
  adminSetup: AdminSetup;
}>({
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  adminApi: async ({ page }, use) => {
    await use(new AdminApi(page.request));
  },

  adminCleanup: async ({ adminApi }, use) => {
    const userIds = new Set<number>();
    const employeeIds = new Set<number>();
    const cleanup: AdminCleanup = {
      trackUser: (id) => userIds.add(id),
      forgetUser: (id) => userIds.delete(id),
      trackEmployee: (id) => employeeIds.add(id),
    };

    try {
      await use(cleanup);
    } finally {
      await adminApi.deleteSystemUsers([...userIds]);
      await adminApi.deleteEmployees([...employeeIds]);
    }
  },

  adminSetup: async ({ adminApi, adminCleanup }, use) => {
    const createEmployee = async () => {
      const data = createAdminEmployee();
      const number = await adminApi.createEmployee(
        data.firstName,
        data.lastName,
        data.employeeId,
      );
      adminCleanup.trackEmployee(number);
      return {
        ...data,
        number,
        fullName: `${data.firstName} ${data.lastName}`,
      };
    };

    await use({
      createEmployee,
      createSystemUser: async () => {
        const employee = await createEmployee();
        const user: SystemUserData = {
          username: createSystemUsername(),
          password: systemUserPassword,
          role: 'ESS',
          roleId: 2,
          status: 'Enabled',
          employeeNumber: employee.number,
        };
        const id = await adminApi.createSystemUser(user);
        adminCleanup.trackUser(id);
        return { id, employee, user };
      },
    });
  },
});

export { expect };
