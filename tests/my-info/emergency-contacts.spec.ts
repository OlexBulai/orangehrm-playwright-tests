import { test, expect } from '../fixtures/my-info/emergency-contacts.fixture';
import { createEmergencyContact } from '../helpers/my-info/emergency-contact-test-helpers';

test.describe('My Info Emergency Contacts tests', () => {
  test('User can open Emergency Contacts', async ({ myInfoPage }) => {
    await myInfoPage.openEmergencyContacts();

    await expect(myInfoPage.page).toHaveURL(
      /viewEmergencyContacts\/empNumber\/\d+/,
    );
  });

  test.describe('Emergency Contact mutations', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo user must not be updated concurrently by browser projects.',
    );

    test.beforeEach(async ({ myInfoPage }) => {
      await myInfoPage.openEmergencyContacts();
    });

    test('User can add an emergency contact', async ({
      myInfoPage,
      emergencyContactCleanup,
    }) => {
      const contact = createEmergencyContact();

      const saved = await myInfoPage.emergencyContacts.addEmergencyContact(contact);
      emergencyContactCleanup.track(Number(saved.data.id));

      await myInfoPage.emergencyContacts.expectContact(contact);
      expect(saved.data).toMatchObject({
        name: contact.name,
        relationship: contact.relationship,
        homePhone: contact.homePhone,
        mobilePhone: contact.mobilePhone,
        officePhone: contact.workPhone,
      });
    });

    test('User can edit an emergency contact', async ({
      myInfoPage,
      emergencyContactSetup,
    }) => {
      const original = createEmergencyContact();
      await emergencyContactSetup.create(original);
      const updated = createEmergencyContact();

      const saved = await myInfoPage.emergencyContacts.editEmergencyContact(
        original.name,
        updated,
      );

      expect(saved.requestData).toMatchObject({
        name: updated.name,
        relationship: updated.relationship,
        homePhone: updated.homePhone,
        mobilePhone: updated.mobilePhone,
        officePhone: updated.workPhone,
      });
    });

    test('User can delete an emergency contact', async ({
      myInfoPage,
      emergencyContactSetup,
      emergencyContactCleanup,
    }) => {
      const contact = createEmergencyContact();
      const id = await emergencyContactSetup.create(contact);

      await myInfoPage.emergencyContacts.deleteEmergencyContact(contact.name);
      emergencyContactCleanup.forget(id);
    });
  });

  test('User cannot add an emergency contact without required fields', async ({
    myInfoPage,
  }) => {
    await myInfoPage.openEmergencyContacts();
    await myInfoPage.emergencyContacts.openAddForm();

    await myInfoPage.emergencyContacts.saveEmptyForm();

    await myInfoPage.emergencyContacts.expectValidationErrors([
      'Required',
      'Required',
      'At least one phone number is required',
    ]);
  });
});
