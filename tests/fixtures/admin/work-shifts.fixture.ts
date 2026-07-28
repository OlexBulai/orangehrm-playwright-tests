import { test as base, expect } from '../shared/authenticated.fixture';
import WorkShiftsApi, {
  WorkShiftData,
} from '../../../src/pages/api/work-shifts-api';
import WorkShiftsComponent from '../../../src/pages/components/work-shifts-component';

type WorkShiftCleanup = { track(id: number): void; forget(id: number): void };

export const test = base.extend<{
  workShifts: WorkShiftsComponent;
  workShiftsApi: WorkShiftsApi;
  workShiftCleanup: WorkShiftCleanup;
  createWorkShiftThroughApi(data: WorkShiftData): Promise<number>;
}>({
  workShifts: async ({ page }, use) => {
    await use(new WorkShiftsComponent(page));
  },
  workShiftsApi: async ({ page }, use) => {
    await use(new WorkShiftsApi(page.request));
  },
  workShiftCleanup: async ({ workShiftsApi }, use) => {
    const ids = new Set<number>();
    const cleanup: WorkShiftCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      await workShiftsApi.deleteWorkShifts([...ids]);
    }
  },
  createWorkShiftThroughApi: async (
    { workShiftsApi, workShiftCleanup },
    use,
  ) => {
    await use(async (data) => {
      const id = await workShiftsApi.createWorkShift(data);
      workShiftCleanup.track(id);
      return id;
    });
  },
});

export { expect };
