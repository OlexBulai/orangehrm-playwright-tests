import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import TimePage from '../src/pages/time-page';
import { usernameLogin, passwordLogin } from '../env';


test.describe('Time Page', () => {
  let timePage: TimePage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();

    timePage = new TimePage(page);
  });

  test('Admin can open Time page', async () => {
    await timePage.open();

    await expect(timePage.timesheetsHeading).toBeVisible();
  });

  test('Admin cannot view timesheet without employee name', async () => {
    await timePage.open();
    await timePage.clickViewTimesheetButton();
    await expect(timePage.requiredMessages).toHaveCount(2);
  });

  test('Admin can view employee timesheet by employee name', async () => {
    await timePage.open();
    await timePage.fillEmployeeName('JoyToy  SmithSmith');
    await timePage.clickViewTimesheetButton();

    await expect(timePage.timesheetForText).toBeVisible();
  });

  test('Admin can open employee timesheet edit mode', async () => {
    await timePage.open();
    await timePage.fillEmployeeName('JoyToy  SmithSmith');
    await timePage.clickViewTimesheetButton();

    await timePage.clickEditButton();
    await expect(timePage.resetButton).toBeVisible();
  });

  test('Admin can cancel employee timesheet editing', async () => {
    await timePage.open();
    await timePage.fillEmployeeName('JoyToy  SmithSmith');
    await timePage.clickViewTimesheetButton();
    await timePage.clickEditButton();
    await timePage.clickCancelButton();
    await expect(timePage.timesheetForText).toBeVisible();
  });

  test('Admin can navigate employee timesheet period', async () => {
    await timePage.open();
    await timePage.fillEmployeeName('JoyToy  SmithSmith');
    await timePage.clickViewTimesheetButton();
    await expect(timePage.timesheetForText).toBeVisible();

    const currentPeriod = await timePage.timesheetPeriodValue.inputValue();

    await timePage.goToNextTimesheetPeriod();

    await expect(timePage.timesheetPeriodValue).not.toHaveValue(currentPeriod);
  });
});
