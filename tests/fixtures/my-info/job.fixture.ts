import { test as base, expect } from './base.fixture';
import JobApi from '../../../src/pages/api/job-api';

type JobFixtures = {
  jobApi: JobApi;
};

export const test = base.extend<JobFixtures>({
  jobApi: async ({ page }, use) => {
    await use(new JobApi(page.request));
  },
});

export { expect };
