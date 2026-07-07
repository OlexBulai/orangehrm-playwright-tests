import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import TimePage from '../src/pages/time-page';
import { usernameLogin, passwordLogin } from '../env';
import { Page } from '@playwright/test';

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
    await timePage.fillEmployeeName('RUD RID RUB');
    await timePage.clickViewTimesheetButton();

    await expect(timePage.timesheetForText).toBeVisible();
  });
});
