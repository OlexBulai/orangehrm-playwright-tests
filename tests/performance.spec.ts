import { test, expect } from './fixtures/shared/authenticated.fixture';
import PerformancePage from '../src/pages/performance-page';

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

  test('Admin can reset Employee Reviews filters', async ({ page }) => {
    const performance = new PerformancePage(page);

    await performance.selectReviewStatus('Activated');
    await expect(performance.reviewStatusSelect).toContainText('Activated');

    await performance.resetButton.click();

    await expect(performance.reviewStatusSelect).toContainText('Select');
  });
});
