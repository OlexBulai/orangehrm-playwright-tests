import { test, expect } from '../fixtures/my-info/salary.fixture';

test.describe('My Info Salary tests', () => {
  test.beforeEach(async ({ myInfoPage }) => {
    await myInfoPage.openSalary();
  });

  test('User can open Salary', async ({ page, myInfoPage }) => {
    await expect(page).toHaveURL(/viewSalaryList\/empNumber\/\d+/);
    await myInfoPage.salary.expectVisible();
  });

  test('Salary table shows all expected columns', async ({ myInfoPage }) => {
    await myInfoPage.salary.expectSalaryColumns();
  });

  test('Salary is read-only in My Info', async ({ myInfoPage }) => {
    await myInfoPage.salary.expectReadOnly();
  });

  test('Salary component count matches API data', async ({
    myInfoPage,
    salaryApi,
    employeeId,
  }) => {
    const total = await salaryApi.getSalaryComponentCount(employeeId);

    await myInfoPage.salary.expectSalaryCount(total);
  });

  test('Salary custom fields API is available', async ({
    salaryApi,
    employeeId,
  }) => {
    const total = await salaryApi.getCustomFieldCount(employeeId);

    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('Salary attachment count matches API data', async ({
    myInfoPage,
    attachmentApi,
    employeeId,
  }) => {
    const total = await attachmentApi.getCount(employeeId, 'salary');

    await myInfoPage.attachments.expectCount(total);
  });
});
