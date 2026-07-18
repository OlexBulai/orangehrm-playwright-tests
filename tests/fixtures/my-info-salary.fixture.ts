import { test as base, expect } from './my-info.fixture';
import SalaryApi from '../../src/pages/api/salary-api';

type SalaryFixtures = {
  salaryApi: SalaryApi;
};

export const test = base.extend<SalaryFixtures>({
  salaryApi: async ({ page }, use) => {
    await use(new SalaryApi(page.request));
  },
});

export { expect };
