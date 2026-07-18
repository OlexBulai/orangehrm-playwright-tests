import { test as base, expect } from './my-info.fixture';
import ReportToApi from '../../src/pages/api/report-to-api';

type ReportToFixtures = {
  reportToApi: ReportToApi;
};

export const test = base.extend<ReportToFixtures>({
  reportToApi: async ({ page }, use) => {
    await use(new ReportToApi(page.request));
  },
});

export { expect };
