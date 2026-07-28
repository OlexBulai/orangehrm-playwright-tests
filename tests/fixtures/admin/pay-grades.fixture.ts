import { test as base, expect } from '../shared/authenticated.fixture';
import PayGradesApi, {
  PayGradeData,
} from '../../../src/pages/api/pay-grades-api';
import PayGradesComponent from '../../../src/pages/components/pay-grades-component';

type PayGradeCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

export const test = base.extend<{
  payGrades: PayGradesComponent;
  payGradesApi: PayGradesApi;
  payGradeCleanup: PayGradeCleanup;
  createPayGradeThroughApi(data: PayGradeData): Promise<number>;
}>({
  payGrades: async ({ page }, use) => {
    await use(new PayGradesComponent(page));
  },

  payGradesApi: async ({ page }, use) => {
    await use(new PayGradesApi(page.request));
  },

  payGradeCleanup: async ({ payGradesApi }, use) => {
    const ids = new Set<number>();
    const cleanup: PayGradeCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      await payGradesApi.deletePayGrades([...ids]);
    }
  },

  createPayGradeThroughApi: async ({ payGradesApi, payGradeCleanup }, use) => {
    await use(async (data) => {
      const id = await payGradesApi.createPayGrade(data);
      payGradeCleanup.track(id);
      return id;
    });
  },
});

export { expect };
