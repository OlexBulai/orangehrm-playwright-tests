import { test, expect } from './fixtures/shared/authenticated.fixture';
import LeavePage from '../src/pages/leave-page';

function toLeaveDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${day}-${month}`;
}

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLeaveDate(date);
}

test.describe('Leave tests', () => {
  test.beforeEach(async ({ page }) => {
    await new LeavePage(page).open();
  });

  test('Admin can open Leave List', async ({ page }) => {
    const leave = new LeavePage(page);

    await expect(leave.heading).toBeVisible();
    await expect(leave.searchButton).toBeVisible();
    await expect(leave.resetButton).toBeVisible();
  });

  test('Admin can search Leave List without changing data', async ({
    page,
  }) => {
    const leave = new LeavePage(page);

    expect((await leave.search()).ok()).toBeTruthy();
  });

  test('Admin can reset Leave List filters', async ({ page }) => {
    const leave = new LeavePage(page);
    const dateInputs = page.locator('.oxd-date-input input');

    await dateInputs.first().fill('2000-01-01');
    await leave.resetButton.click();

    await expect(dateInputs.first()).not.toHaveValue('2000-01-01');
  });

  test('Admin cannot assign leave without required fields', async ({
    page,
  }) => {
    const leave = new LeavePage(page);

    await leave.openAssignLeave();
    await leave.submitEmptyAssignLeaveForm();

    await expect(leave.requiredMessages).not.toHaveCount(0);
  });

  test('Admin cannot assign leave when From Date is later than To Date', async ({
    page,
  }) => {
    const leave = new LeavePage(page);

    await leave.openAssignLeave();
    const employeeName = await leave.fillAssignLeaveForm(
      dateAfter(2),
      dateAfter(1),
      'Invalid date range check',
    );
    await leave.assignLeave();

    await expect(leave.invalidDateMessage).toBeVisible();
    await expect(leave.successToast).toBeHidden();
    await expect(leave.assignLeaveHeading).toBeVisible();
    await expect(leave.employeeNameInput).toHaveValue(employeeName);
    await expect(page).toHaveURL(/leave\/assignLeave/);
  });

  test('Admin can cancel assigning leave', async ({ page }) => {
    const leave = new LeavePage(page);

    await leave.openAssignLeave();
    const employeeName = await leave.fillAssignLeaveForm(
      dateAfter(1),
      dateAfter(45),
      'Leave assignment cancellation check',
    );
    await leave.assignLeave();
    await expect(leave.confirmationHeading).toBeVisible();

    await leave.cancelLeaveConfirmation();

    await expect(leave.confirmationHeading).toBeHidden();
    await expect(leave.successToast).toBeHidden();
    await expect(leave.assignLeaveHeading).toBeVisible();
    await expect(leave.employeeNameInput).toHaveValue(employeeName);
    await expect(page).toHaveURL(/leave\/assignLeave/);
  });
});
