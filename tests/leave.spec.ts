import { test, expect } from './fixtures/shared/authenticated.fixture';
import LeavePage from '../src/pages/leave-page';

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
});
