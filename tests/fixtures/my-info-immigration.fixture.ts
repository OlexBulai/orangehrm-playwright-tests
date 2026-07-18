import { test as base, expect } from './my-info.fixture';
import ImmigrationApi from '../../src/pages/api/immigration-api';
import { ImmigrationDocumentData } from '../../src/pages/components/immigration-component';

type ImmigrationCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

type ImmigrationSetup = {
  create(data: ImmigrationDocumentData): Promise<number>;
};

type ImmigrationFixtures = {
  immigrationApi: ImmigrationApi;
  immigrationCleanup: ImmigrationCleanup;
  immigrationSetup: ImmigrationSetup;
};

export const test = base.extend<ImmigrationFixtures>({
  immigrationApi: async ({ page }, use) => {
    await use(new ImmigrationApi(page.request));
  },

  immigrationCleanup: async (
    { immigrationApi, employeeId },
    use,
    testInfo,
  ) => {
    const ids = new Set<number>();
    const cleanup: ImmigrationCleanup = {
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
        await immigrationApi.delete(employeeId, [...ids]);
      } catch (cleanupError) {
        if (testError || testInfo.status !== testInfo.expectedStatus) {
          console.error('Immigration cleanup failed:', cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }
  },

  immigrationSetup: async (
    {
      page,
      myInfoPage,
      immigrationApi,
      employeeId,
      immigrationCleanup,
    },
    use,
  ) => {
    await use({
      create: async (data) => {
        const id = await immigrationApi.create(employeeId, data);
        immigrationCleanup.track(id);
        await page.reload();
        await myInfoPage.immigration.expectDocument(data);
        return id;
      },
    });
  },
});

export { expect };
