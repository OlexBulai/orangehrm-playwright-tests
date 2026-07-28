import { test, expect } from './fixtures/shared/authenticated.fixture';
import DashboardPage from '../src/pages/dashboard-page';

test.describe('Dashboard tests', () => {
  test('Admin can open Dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.open();
    await expect(dashboard.widgets.first()).toBeVisible();
    expect(await dashboard.widgets.count()).toBeGreaterThan(0);
  });

  test('Dashboard loads widget data', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/dashboard/'),
    );

    await dashboard.open();

    expect((await responsePromise).ok()).toBeTruthy();
  });
});
