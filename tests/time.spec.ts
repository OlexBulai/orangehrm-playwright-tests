import { test, expect } from './fixtures/shared/authenticated.fixture';
import TimePage from '../src/pages/time-page';


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
});
