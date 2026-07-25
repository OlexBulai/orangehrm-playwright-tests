import { test as base, expect } from '../shared/authenticated.fixture';
import EmploymentStatusApi, {
  EmploymentStatusData,
} from '../../../src/pages/api/employment-status-api';
import EmploymentStatusComponent from '../../../src/pages/components/employment-status-component';

type EmploymentStatusCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

export const test = base.extend<{
  employmentStatus: EmploymentStatusComponent;
  employmentStatusApi: EmploymentStatusApi;
  employmentStatusCleanup: EmploymentStatusCleanup;
  createEmploymentStatusThroughApi(
    data: EmploymentStatusData,
  ): Promise<number>;
}>({
  employmentStatus: async ({ page }, use) => {
    await use(new EmploymentStatusComponent(page));
  },

  employmentStatusApi: async ({ page }, use) => {
    await use(new EmploymentStatusApi(page.request));
  },

  employmentStatusCleanup: async ({ employmentStatusApi }, use) => {
    const ids = new Set<number>();
    const cleanup: EmploymentStatusCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      await employmentStatusApi.deleteEmploymentStatuses([...ids]);
    }
  },

  createEmploymentStatusThroughApi: async (
    { employmentStatusApi, employmentStatusCleanup },
    use,
  ) => {
    await use(async (data) => {
      const id = await employmentStatusApi.createEmploymentStatus(data);
      employmentStatusCleanup.track(id);
      return id;
    });
  },
});

export { expect };
