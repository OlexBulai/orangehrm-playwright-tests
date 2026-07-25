import { test as base, expect } from '../shared/authenticated.fixture';
import JobTitlesApi, {
  JobTitleData,
} from '../../../src/pages/api/job-titles-api';
import JobTitlesComponent from '../../../src/pages/components/job-titles-component';

type JobTitleCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

export const test = base.extend<{
  jobTitles: JobTitlesComponent;
  jobTitlesApi: JobTitlesApi;
  jobTitleCleanup: JobTitleCleanup;
  createJobTitleThroughApi(data: JobTitleData): Promise<number>;
}>({
  jobTitles: async ({ page }, use) => {
    await use(new JobTitlesComponent(page));
  },

  jobTitlesApi: async ({ page }, use) => {
    await use(new JobTitlesApi(page.request));
  },

  jobTitleCleanup: async ({ jobTitlesApi }, use) => {
    const ids = new Set<number>();
    const cleanup: JobTitleCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      await jobTitlesApi.deleteJobTitles([...ids]);
    }
  },

  createJobTitleThroughApi: async (
    { jobTitlesApi, jobTitleCleanup },
    use,
  ) => {
    await use(async (data) => {
      const id = await jobTitlesApi.createJobTitle(data);
      jobTitleCleanup.track(id);
      return id;
    });
  },
});

export { expect };
