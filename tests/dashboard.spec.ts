import { test, expect } from './fixtures/shared/authenticated.fixture';
import DashboardPage from '../src/pages/dashboard-page';

test.describe('Dashboard tests', () => {
  for (const { action, url, heading } of [
    {
      action: 'Assign Leave',
      url: /leave\/assignLeave/,
      heading: 'Assign Leave',
    },
    {
      action: 'My Leave',
      url: /leave\/viewMyLeaveList/,
      heading: 'My Leave List',
    },
  ] as const) {
    test(`Admin can open ${action} from Dashboard Quick Launch`, async ({
      page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.open();
      await dashboard.openQuickLaunch(action);

      await expect(page).toHaveURL(url);
      await expect(
        page.getByRole('heading', { name: heading, exact: true }),
      ).toBeVisible();
      await expect(dashboard.heading).toBeHidden();
    });
  }

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

  test('Dashboard shows Quick Launch actions', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.open();

    await expect(dashboard.quickLaunchCards).toHaveCount(6);
    for (const action of [
      'Assign Leave',
      'Leave List',
      'Timesheets',
      'Apply Leave',
      'My Leave',
      'My Timesheet',
    ]) {
      await expect(page.getByText(action, { exact: true })).toBeVisible();
    }
  });

  test('Admin can open Leave List from Dashboard Quick Launch', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.open();
    await dashboard.openQuickLaunch('Leave List');

    await expect(page).toHaveURL(/leave\/viewLeaveList/);
    await expect(
      page.getByRole('heading', { name: 'Leave List', exact: true }),
    ).toBeVisible();
  });

  test('Admin can open Timesheets from Dashboard Quick Launch', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.open();
    await dashboard.openQuickLaunch('Timesheets');

    await expect(page).toHaveURL(/time\/viewEmployeeTimesheet/);
    await expect(
      page.getByRole('heading', { name: 'Select Employee', exact: true }),
    ).toBeVisible();
  });
  
  test('Admin can open Apply Leave from Dashboard Quick Launch.', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    
    await dashboard.open();
    await dashboard.openQuickLaunch('Apply Leave');

    await expect(page).toHaveURL(/leave\/applyLeave/);
    await expect(
      page.getByRole('heading', { name: 'Apply Leave', exact: true }),
    ).toBeVisible();

    
  });


});
