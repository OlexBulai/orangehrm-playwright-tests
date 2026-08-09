import { test, expect } from './fixtures/pim.fixture';
import PerformancePage from '../src/pages/performance-page';
import { faker } from '@faker-js/faker';
import { baseUrl } from '../env';
import PerformanceApi from '../src/pages/api/performance-api';
import { createPimEmployee } from './helpers/pim-test-helpers';

test.describe('Performance tests', () => {
  test.beforeEach(async ({ page }) => {
    await new PerformancePage(page).open();
  });

  test('Admin can open Employee Reviews', async ({ page }) => {
    const performance = new PerformancePage(page);

    await expect(performance.heading).toBeVisible();
    await expect(performance.employeeNameInput).toBeVisible();
    await expect(performance.resetButton).toBeVisible();
  });

  test('Admin can open KPIs', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.openKpis();

    await expect(page).toHaveURL(/performance\/searchKpi/);
    await expect(performance.kpisHeading).toBeVisible();
  });

  test('Admin can open Trackers', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.openTrackers();

    await expect(page).toHaveURL(/performance\/viewPerformanceTracker/);
    await expect(performance.trackersHeading).toBeVisible();
  });

  test('KPI form shows required field validation', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.openAddKpiForm();
    await performance.saveEmptyForm();

    await expect(performance.requiredMessages).not.toHaveCount(0);
  });

  test('Tracker form shows required field validation', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.openAddTrackerForm();
    await performance.saveEmptyForm();

    await expect(performance.requiredMessages).not.toHaveCount(0);
  });

  test('Employee Review form shows required field validation', async ({
    page,
  }) => {
    const performance = new PerformancePage(page);

    await performance.openAddReviewForm();
    await performance.saveEmptyForm();

    await expect(performance.requiredMessages).not.toHaveCount(0);
  });

  test(
    'Admin can create, edit and delete a KPI',
    { tag: '@mutation' },
    async ({ page }) => {
      const performance = new PerformancePage(page);
      const suffix = faker.string.alphanumeric(10);
      const originalName = `QA KPI ${suffix}`;
      const updatedName = `QA KPI Updated ${suffix}`;
      let kpiId: number | undefined;

      try {
        kpiId = await performance.createKpi(originalName, '1', '5');
        await performance.expectKpi(originalName);
        await performance.editKpi(originalName, updatedName, '2', '10');
        await performance.openKpis();
        await performance.expectKpi(updatedName);
        await performance.deleteKpi(updatedName);
        kpiId = undefined;
      } finally {
        if (kpiId !== undefined) {
          const response = await page.request.delete(
            `${baseUrl}/api/v2/performance/kpis`,
            { data: { ids: [kpiId] } },
          );
          expect([200, 404]).toContain(response.status());
        }
      }
    },
  );

  test(
    'Admin can create, view, edit and delete a performance tracker',
    { tag: '@mutation' },
    async ({ page, createEmployeeThroughApi }) => {
      const performance = new PerformancePage(page);
      const performanceApi = new PerformanceApi(page.request);
      const employee = createPimEmployee('tracker-employee');
      const reviewer = createPimEmployee('tracker-reviewer');
      const employeeName = `${employee.firstName} ${employee.lastName}`;
      const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
      const suffix = faker.string.alphanumeric(10);
      const originalName = `QA Tracker ${suffix}`;
      const updatedName = `QA Tracker Updated ${suffix}`;
      let trackerId: number | undefined;

      await createEmployeeThroughApi(employee);
      await createEmployeeThroughApi(reviewer);

      try {
        trackerId = await performance.createTracker(
          originalName,
          employeeName,
          reviewerName,
        );
        await performance.expectTracker(originalName);

        await performance.editTracker(originalName, updatedName);
        await performance.openTrackers();
        await performance.expectTracker(updatedName);

        await performance.deleteTracker(updatedName);
        trackerId = undefined;
      } finally {
        if (trackerId !== undefined) {
          await performanceApi.deleteTrackers([trackerId]);
        }
      }
    },
  );

  test('Admin can reset Employee Reviews filters', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.selectReviewStatus('Activated');
    await expect(performance.reviewStatusSelect).toContainText('Activated');

    await performance.resetButton.click();

    await expect(performance.reviewStatusSelect).toContainText('Select');
  });
});
