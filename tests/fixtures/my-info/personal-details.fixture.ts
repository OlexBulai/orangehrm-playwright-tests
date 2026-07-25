import { test as base, expect } from './base.fixture';
import PersonalDetailsApi, {
  PersonalDetailsSnapshot,
} from '../../../src/pages/api/personal-details-api';

type PersonalDetailsFixtures = {
  personalDetailsApi: PersonalDetailsApi;
  originalPersonalDetails: PersonalDetailsSnapshot;
};

export const test = base.extend<PersonalDetailsFixtures>({
  personalDetailsApi: async ({ page }, use) => {
    await use(new PersonalDetailsApi(page.request));
  },

  originalPersonalDetails: async (
    { personalDetailsApi, employeeId },
    use,
    testInfo,
  ) => {
    const original = await personalDetailsApi.get(employeeId);
    let testError: unknown;

    try {
      await use(original);
    } catch (error) {
      testError = error;
      throw error;
    } finally {
      try {
        await personalDetailsApi.restore(employeeId, original);
      } catch (cleanupError) {
        if (testError || testInfo.status !== testInfo.expectedStatus) {
          console.error('Personal Details cleanup failed:', cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }
  },
});

export { expect };
