import { test as base, expect } from './base.fixture';
import DependentApi from '../../../src/pages/api/dependent-api';
import { DependentData } from '../../../src/pages/components/dependents-component';

type DependentCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

type DependentSetup = {
  create(data: DependentData): Promise<number>;
};

type DependentFixtures = {
  dependentApi: DependentApi;
  dependentCleanup: DependentCleanup;
  dependentSetup: DependentSetup;
};

export const test = base.extend<DependentFixtures>({
  dependentApi: async ({ page }, use) => {
    await use(new DependentApi(page.request));
  },

  dependentCleanup: async ({ dependentApi, employeeId }, use, testInfo) => {
    const ids = new Set<number>();
    const cleanup: DependentCleanup = {
      track: (id) => ids.add(id),
      forget: (id) => ids.delete(id),
    };
    let testError: unknown;

    try {
      await use(cleanup);
    } catch (error) {
      testError = error;
      throw error;
    } finally {
      try {
        await dependentApi.delete(employeeId, [...ids]);
      } catch (cleanupError) {
        if (testError || testInfo.status !== testInfo.expectedStatus) {
          console.error('Dependent cleanup failed:', cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }
  },

  dependentSetup: async (
    { page, myInfoPage, dependentApi, employeeId, dependentCleanup },
    use,
  ) => {
    await use({
      create: async (data) => {
        const id = await dependentApi.create(employeeId, data);
        dependentCleanup.track(id);
        await page.reload();
        await myInfoPage.dependents.expectDependent(data);
        return id;
      },
    });
  },
});

export { expect };
