import { test, expect } from '../fixtures/my-info/base.fixture';

test.describe('My Info navigation tests', () => {
  test('User can navigate through all My Info tabs in order', async ({
    myInfoPage,
  }) => {
    test.setTimeout(90_000);

    const tabs = [
      {
        name: 'Personal Details',
        open: () =>
          myInfoPage.page
            .getByRole('link', { name: 'Personal Details' })
            .click(),
        url: /viewPersonalDetails\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.personalDetails.expectVisible(),
      },
      {
        name: 'Contact Details',
        open: () => myInfoPage.openContactDetails(),
        url: /contactDetails\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.contactDetails.expectVisible(),
      },
      {
        name: 'Emergency Contacts',
        open: () => myInfoPage.openEmergencyContacts(),
        url: /viewEmergencyContacts\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.emergencyContacts.expectVisible(),
      },
      {
        name: 'Dependents',
        open: () => myInfoPage.openDependents(),
        url: /viewDependents\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.dependents.expectVisible(),
      },
      {
        name: 'Immigration',
        open: () => myInfoPage.openImmigration(),
        url: /viewImmigration\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.immigration.expectVisible(),
      },
      {
        name: 'Job',
        open: () => myInfoPage.openJob(),
        url: /viewJobDetails\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.job.expectVisible(),
      },
      {
        name: 'Salary',
        open: () => myInfoPage.openSalary(),
        url: /viewSalaryList\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.salary.expectVisible(),
      },
      {
        name: 'Report-to',
        open: () => myInfoPage.openReportTo(),
        url: /viewReportToDetails\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.reportTo.expectVisible(),
      },
      {
        name: 'Qualifications',
        open: () => myInfoPage.openQualifications(),
        url: /viewQualifications\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.qualifications.expectVisible(),
      },
      {
        name: 'Memberships',
        open: () => myInfoPage.openMembership(),
        url: /viewMemberships\/empNumber\/\d+/,
        expectVisible: () => myInfoPage.memberships.expectVisible(),
      },
    ];

    for (const tab of tabs) {
      await test.step(`Open ${tab.name}`, async () => {
        await tab.open();
        await expect(myInfoPage.page).toHaveURL(tab.url);
        await tab.expectVisible();
      });
    }
  });
});
