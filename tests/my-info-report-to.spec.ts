import { test, expect } from './fixtures/my-info-report-to.fixture';

test.describe('My Info Report-to tests', () => {
  test.beforeEach(async ({ myInfoPage }) => {
    await myInfoPage.openReportTo();
  });

  test('User can open Report-to', async ({ page, myInfoPage }) => {
    await expect(page).toHaveURL(/viewReportToDetails\/empNumber\/\d+/);
    await myInfoPage.reportTo.expectVisible();
  });

  test('Assigned Supervisors table has the expected columns', async ({
    myInfoPage,
  }) => {
    await myInfoPage.reportTo.expectRelationColumns(
      myInfoPage.reportTo.supervisorsHeading,
    );
  });

  test('Assigned Subordinates table has the expected columns', async ({
    myInfoPage,
  }) => {
    await myInfoPage.reportTo.expectRelationColumns(
      myInfoPage.reportTo.subordinatesHeading,
    );
  });

  test('Assigned Supervisors UI matches API data', async ({
    myInfoPage,
    reportToApi,
    employeeId,
  }) => {
    const supervisors = await reportToApi.getSupervisors(employeeId);

    await myInfoPage.reportTo.expectSupervisors(supervisors);
  });

  test('Assigned Subordinates UI matches API data', async ({
    myInfoPage,
    reportToApi,
    employeeId,
  }) => {
    const subordinates = await reportToApi.getSubordinates(employeeId);

    await myInfoPage.reportTo.expectSubordinates(subordinates);
  });

  test('Report-to is read-only in My Info', async ({ myInfoPage }) => {
    await myInfoPage.reportTo.expectReadOnly();
  });

  test('Report-to custom fields API is available', async ({
    reportToApi,
    employeeId,
  }) => {
    const total = await reportToApi.getCustomFieldCount(employeeId);

    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('Report-to attachment count matches API data', async ({
    myInfoPage,
    attachmentApi,
    employeeId,
  }) => {
    const total = await attachmentApi.getCount(employeeId, 'report-to');

    await myInfoPage.attachments.expectCount(total);
  });
});
