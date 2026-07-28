import { test, expect } from '../fixtures/my-info/contact-details.fixture';
import {
  createContactDetails,
  createInvalidEmail,
} from '../helpers/my-info/contact-details-test-helpers';

test.describe('My Info Contact Details tests', () => {
  test('User can open Contact Details', async ({ myInfoPage }) => {
    await myInfoPage.openContactDetails();

    await expect(myInfoPage.page).toHaveURL(/contactDetails\/empNumber\/\d+/);
    await myInfoPage.contactDetails.expectVisible();
  });

  test.describe('Contact Details update', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo user must not be updated concurrently by browser projects.',
    );

    test('User can update Contact Details', async ({
      myInfoPage,
      originalContactDetails: _originalContactDetails,
    }, testInfo) => {
      testInfo.setTimeout(90_000);
      const contactDetails = createContactDetails();

      await myInfoPage.contactDetails.fill(contactDetails);
      const savedData = await myInfoPage.contactDetails.saveContactDetails();

      await myInfoPage.page.reload();
      await myInfoPage.contactDetails.expectValues(contactDetails);

      expect(savedData).toMatchObject({
        street1: contactDetails.street1,
        street2: contactDetails.street2,
        city: contactDetails.city,
        province: contactDetails.state,
        zipCode: contactDetails.zipCode,
        homeTelephone: contactDetails.homePhone,
        mobile: contactDetails.mobile,
        workTelephone: contactDetails.workPhone,
        workEmail: contactDetails.workEmail,
        otherEmail: contactDetails.otherEmail,
      });
    });
  });

  test('User cannot use an invalid work email', async ({ myInfoPage }) => {
    await myInfoPage.openContactDetails();
    const invalidEmail = createInvalidEmail();

    await myInfoPage.contactDetails.fillWorkEmail(invalidEmail);

    await myInfoPage.contactDetails.expectWorkEmailValidation(
      'Expected format: admin@example.com',
    );
  });
});
