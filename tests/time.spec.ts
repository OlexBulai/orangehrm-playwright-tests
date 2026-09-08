import { test, expect } from './fixtures/shared/authenticated.fixture';
import TimePage from '../src/pages/time-page';
import { faker } from '@faker-js/faker';
import { baseUrl } from '../env';
import PimApi from '../src/pages/api/pim-api';
import TimeApi from '../src/pages/api/time-api';

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

  test('Admin can clear Employee Name in Employee Timesheets', async ({
    page,
  }) => {
    await timePage.open();
    const employeeName = await timePage.selectAvailableEmployee();
    await expect(timePage.employeeNameInput).toHaveValue(employeeName);

    // Employee Timesheets has no Reset button; clear the employee selection.
    await timePage.clearEmployeeSearch();

    await expect(timePage.employeeNameInput).toHaveValue('');
    await expect(timePage.selectEmployeeHeading).toBeVisible();
    await expect(timePage.timesheetsHeading).toBeVisible();
    await expect(timePage.viewButton).toBeVisible();
    await expect(page).toHaveURL(/time\/viewEmployeeTimesheet/);
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
    'Admin can add an entry to an employee timesheet and submit it',
    { tag: '@mutation' },
    async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const employeeName = `${firstName} ${lastName}`;
      const customerName = `QA Customer ${faker.string.alphanumeric(8)}`;
      const projectName = `QA Project ${faker.string.alphanumeric(8)}`;
      const activityName = `QA Activity ${faker.string.alphanumeric(8)}`;
      const hours = '8';
      let employeeNumber: number | undefined;
      let customerId: number | undefined;
      let projectId: number | undefined;
      let timesheetId: number | undefined;

      const pimApi = new PimApi(page.request);
      const timeApi = new TimeApi(page.request);

      try {
        employeeNumber = await pimApi.createEmployee({
          firstName,
          middleName: '',
          lastName,
          employeeId: faker.string.numeric(8),
        });
        customerId = await timeApi.createCustomer(customerName);
        projectId = await timeApi.createProject(
          projectName,
          customerId,
          employeeNumber,
        );
        await timeApi.createActivity(projectId, activityName);
        timesheetId = await timeApi.createTimesheet(employeeNumber);

        await timePage.open();
        await timePage.selectEmployee(employeeName);
        await timePage.clickViewTimesheetButton();
        await timePage.editTimesheet();
        await timePage.addTimesheetEntry(projectName, activityName, hours);
        await timePage.saveTimesheet();
        await timePage.submitTimesheet();

        await expect(page.getByText('Status: Submitted')).toBeVisible();
      } finally {
        testInfo.setTimeout(testInfo.timeout + 60_000);
        if (employeeNumber !== undefined && timesheetId !== undefined) {
          await timeApi.clearTimesheet(employeeNumber, timesheetId);
        }
        if (employeeNumber !== undefined) {
          await pimApi.deleteEmployees([employeeNumber]);
        }
        if (projectId !== undefined) {
          await timeApi.deleteProjects([projectId]);
        }
        if (customerId !== undefined) {
          await timeApi.deleteCustomers([customerId]);
        }
      }
    },
  );

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
