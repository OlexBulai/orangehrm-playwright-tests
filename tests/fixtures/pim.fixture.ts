import { expect, test as base } from './shared/authenticated.fixture';
import PimApi, { PimEmployeeData } from '../../src/pages/api/pim-api';

type PimCleanup = {
  track(employeeNumber: number): void;
  forget(employeeNumber: number): void;
};

export const test = base.extend<{
  pimApi: PimApi;
  pimCleanup: PimCleanup;
  createEmployeeThroughApi(data: PimEmployeeData): Promise<number>;
}>({
  pimApi: async ({ page }, use) => {
    await use(new PimApi(page.request));
  },

  pimCleanup: async ({ pimApi }, use) => {
    const employeeNumbers = new Set<number>();
    const cleanup: PimCleanup = {
      track: (employeeNumber) => employeeNumbers.add(employeeNumber),
      forget: (employeeNumber) => employeeNumbers.delete(employeeNumber),
    };

    try {
      await use(cleanup);
    } finally {
      await pimApi.deleteEmployees([...employeeNumbers]);
    }
  },

  createEmployeeThroughApi: async ({ pimApi, pimCleanup }, use) => {
    await use(async (data) => {
      const employeeNumber = await pimApi.createEmployee(data);
      pimCleanup.track(employeeNumber);
      return employeeNumber;
    });
  },
});

export { expect };
