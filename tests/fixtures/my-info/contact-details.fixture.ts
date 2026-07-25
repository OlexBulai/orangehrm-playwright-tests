import { test as base, expect } from './base.fixture';
import { ContactDetailsData } from '../../../src/pages/components/contact-details-component';

type ContactDetailsFixtures = {
  originalContactDetails: ContactDetailsData;
};

export const test = base.extend<ContactDetailsFixtures>({
  originalContactDetails: async ({ myInfoPage, page }, use, testInfo) => {
    await myInfoPage.openContactDetails();
    await myInfoPage.contactDetails.expectVisible();
    const original = await myInfoPage.contactDetails.read();
    let testError: unknown;

    try {
      await use(original);
    } catch (error) {
      testError = error;
      throw error;
    } finally {
      try {
        await page.reload();
        await myInfoPage.contactDetails.expectVisible();
        await myInfoPage.contactDetails.update(original);
      } catch (cleanupError) {
        if (testError || testInfo.status !== testInfo.expectedStatus) {
          console.error('Contact Details cleanup failed:', cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }
  },
});

export { expect };
