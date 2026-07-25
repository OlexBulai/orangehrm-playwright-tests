import { test, expect } from '../fixtures/my-info/personal-details.fixture';
import {
  createDrivingLicenseDetails,
  createEmployeeIdentifiers,
  createEmployeeName,
  createPersonalSelections,
} from '../helpers/my-info/personal-details-test-helpers';

test.describe('My Info Personal Details tests', () => {
  test('User can open Personal Details', async ({ myInfoPage }) => {
    await expect(myInfoPage.page).toHaveURL(
      /viewPersonalDetails\/empNumber\/\d+/,
    );
    await myInfoPage.personalDetails.expectVisible();
  });

  test.describe('Personal Details updates', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo user must not be updated concurrently by browser projects.',
    );

    test('User can update employee name', async ({
      myInfoPage,
      originalPersonalDetails: _originalPersonalDetails,
    }) => {
      const name = createEmployeeName();

      await myInfoPage.personalDetails.fillEmployeeName(name);
      await myInfoPage.personalDetails.expectEmployeeName(name);
      const requestData = await myInfoPage.personalDetails.savePersonalDetails();

      expect(requestData).toMatchObject(name);
    });

    test('User can update employee identifiers', async ({
      myInfoPage,
      originalPersonalDetails: _originalPersonalDetails,
    }) => {
      const identifiers = createEmployeeIdentifiers();

      await myInfoPage.personalDetails.fillIdentifiers(identifiers);
      await myInfoPage.personalDetails.expectIdentifiers(identifiers);
      const requestData = await myInfoPage.personalDetails.savePersonalDetails();

      expect(requestData).toMatchObject(identifiers);
    });

    test('User can update driving license details', async ({
      myInfoPage,
      originalPersonalDetails: _originalPersonalDetails,
    }) => {
      const license = createDrivingLicenseDetails();

      await myInfoPage.personalDetails.fillDrivingLicense(license);
      await myInfoPage.personalDetails.expectDrivingLicense(license);
      const requestData = await myInfoPage.personalDetails.savePersonalDetails();

      expect(requestData).toMatchObject({
        drivingLicenseNo: license.number,
        drivingLicenseExpiredDate: '2028-06-15',
      });
    });

    test('User can update personal selections', async ({
      myInfoPage,
      originalPersonalDetails: _originalPersonalDetails,
    }) => {
      const selections = createPersonalSelections();

      await myInfoPage.personalDetails.fillSelections(selections);
      await myInfoPage.personalDetails.expectSelections(selections);
      const requestData = await myInfoPage.personalDetails.savePersonalDetails();

      expect(requestData).toMatchObject({
        maritalStatus: selections.maritalStatus,
      });
      expect(String(requestData.gender)).toBe('2');
    });
  });

  test('User cannot save without required employee names', async ({
    myInfoPage,
  }) => {
    await myInfoPage.personalDetails.clearRequiredNamesAndSave();

    await myInfoPage.personalDetails.expectRequiredNameErrors();
  });
});
