import { test as base, expect } from '../shared/authenticated.fixture';
import JobCategoriesApi, {
  JobCategoryData,
} from '../../../src/pages/api/job-categories-api';
import JobCategoriesComponent from '../../../src/pages/components/job-categories-component';

type JobCategoryCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

export const test = base.extend<{
  jobCategories: JobCategoriesComponent;
  jobCategoriesApi: JobCategoriesApi;
  jobCategoryCleanup: JobCategoryCleanup;
  createJobCategoryThroughApi(data: JobCategoryData): Promise<number>;
}>({
  jobCategories: async ({ page }, use) => {
    await use(new JobCategoriesComponent(page));
  },
  jobCategoriesApi: async ({ page }, use) => {
    await use(new JobCategoriesApi(page.request));
  },
  jobCategoryCleanup: async ({ jobCategoriesApi }, use) => {
    const ids = new Set<number>();
    const cleanup: JobCategoryCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      await jobCategoriesApi.deleteJobCategories([...ids]);
    }
  },
  createJobCategoryThroughApi: async (
    { jobCategoriesApi, jobCategoryCleanup },
    use,
  ) => {
    await use(async (data) => {
      const id = await jobCategoriesApi.createJobCategory(data);
      jobCategoryCleanup.track(id);
      return id;
    });
  },
});

export { expect };
