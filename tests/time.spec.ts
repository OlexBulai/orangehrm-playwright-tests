import { test, expect } from './fixtures/shared/authenticated.fixture';
import TimePage from '../src/pages/time-page';
import { faker } from '@faker-js/faker';
import { baseUrl } from '../env';

test.describe('Time Page', () => {
  let timePage: TimePage;

  test.beforeEach(async ({ page }) => {
    timePage = new TimePage(page);
  });

  test('Admin can open Time page', async () => {
    await timePage.open();

    await expect(timePage.timesheetsHeading).toBeVisible();
  });

  test('Admin cannot view timesheet without employee name', async () => {
    await timePage.open();
    await timePage.viewButton.click();
    await expect(timePage.requiredMessages).toHaveCount(2);
  });

  test('Admin can view employee timesheet by employee name', async () => {
    await timePage.open();
    await timePage.selectAvailableEmployee();
    await timePage.clickViewTimesheetButton();

    await expect(timePage.timesheetForText).toBeVisible();
  });

  test('Admin can navigate employee timesheet period', async () => {
    await timePage.open();
    await timePage.selectAvailableEmployee();
    await timePage.clickViewTimesheetButton();
    await expect(timePage.timesheetForText).toBeVisible();

    const currentPeriod = await timePage.timesheetPeriodValue.inputValue();

    await timePage.goToNextTimesheetPeriod();

    await expect(timePage.timesheetPeriodValue).not.toHaveValue(currentPeriod);
  });

  test('Admin can open Attendance Employee Records', async ({ page }) => {
    await timePage.open();
    await timePage.openAttendanceEmployeeRecords();

    await expect(
      page.getByRole('heading', {
        name: 'Employee Attendance Records',
        exact: true,
      }),
    ).toBeVisible();
  });

  test('Admin can open Project Customers', async ({ page }) => {
    await timePage.open();
    await timePage.openProjectCustomers();

    await expect(
      page.getByRole('heading', { name: 'Customers', exact: true }),
    ).toBeVisible();
  });

  test('Admin cannot create a customer without a name', async () => {
    await timePage.open();
    await timePage.openAddCustomerForm();
    await timePage.saveEmptyCustomerForm();

    await expect(timePage.requiredMessages).not.toHaveCount(0);
  });

  test(
    'Admin can create and delete a customer',
    { tag: '@mutation' },
    async ({ page }) => {
      const name = `QA Customer ${faker.string.alphanumeric(10)}`;
      let customerId: number | undefined;

      try {
        await timePage.open();
        customerId = await timePage.createCustomer(
          name,
          'Created by Playwright automation',
        );
        await timePage.deleteCustomer(name);
        customerId = undefined;
      } finally {
        if (customerId !== undefined) {
          const response = await page.request.delete(
            `${baseUrl}/api/v2/time/customers`,
            { data: { ids: [customerId] } },
          );
          expect([200, 404]).toContain(response.status());
        }
      }
    },
  );
});
