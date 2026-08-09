import { test, expect } from './fixtures/shared/authenticated.fixture';
import ClaimPage from '../src/pages/claim-page';

test.describe('Claim tests', () => {
  test.beforeEach(async ({ page }) => {
    await new ClaimPage(page).open();
  });

  test('Admin can open Employee Claims', async ({ page }) => {
    const claim = new ClaimPage(page);

    await expect(claim.heading).toBeVisible();
    await expect(claim.searchButton).toBeVisible();
    await expect(claim.resetButton).toBeVisible();
  });

  test('Admin can search Employee Claims without changing data', async ({
    page,
  }) => {
    const claim = new ClaimPage(page);

    expect((await claim.search()).ok()).toBeTruthy();
  });

  test('Admin cannot assign a claim without required fields', async ({
    page,
  }) => {
    const claim = new ClaimPage(page);

    await claim.openAssignClaimForm();
    await claim.submitEmptyClaimForm();

    await expect(claim.requiredMessages).not.toHaveCount(0);
  });
});
