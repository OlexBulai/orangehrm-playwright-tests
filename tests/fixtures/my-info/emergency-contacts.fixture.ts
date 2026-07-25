import { test as base, expect } from './base.fixture';
import EmergencyContactApi from '../../../src/pages/api/emergency-contact-api';
import { EmergencyContactData } from '../../../src/pages/components/emergency-contacts-component';

type EmergencyContactCleanup = {
  track(id: number): void;
  forget(id: number): void;
};

type EmergencyContactSetup = {
  create(data: EmergencyContactData): Promise<number>;
};

type EmergencyContactFixtures = {
  emergencyContactApi: EmergencyContactApi;
  emergencyContactCleanup: EmergencyContactCleanup;
  emergencyContactSetup: EmergencyContactSetup;
};

export const test = base.extend<EmergencyContactFixtures>({
  emergencyContactApi: async ({ page }, use) => {
    await use(new EmergencyContactApi(page.request));
  },

  emergencyContactCleanup: async (
    { emergencyContactApi, employeeId },
    use,
    testInfo,
  ) => {
    const ids = new Set<number>();
    const cleanup: EmergencyContactCleanup = {
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
        await emergencyContactApi.delete(employeeId, [...ids]);
      } catch (cleanupError) {
        if (testError || testInfo.status !== testInfo.expectedStatus) {
          console.error('Emergency Contact cleanup failed:', cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }
  },

  emergencyContactSetup: async (
    {
      page,
      myInfoPage,
      emergencyContactApi,
      employeeId,
      emergencyContactCleanup,
    },
    use,
  ) => {
    await use({
      create: async (data) => {
        const id = await emergencyContactApi.create(employeeId, data);
        emergencyContactCleanup.track(id);
        await page.reload();
        await myInfoPage.emergencyContacts.expectContact(data);
        return id;
      },
    });
  },
});

export { expect };
