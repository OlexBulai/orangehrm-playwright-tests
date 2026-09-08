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

  test('Admin can search Employee Claims by Status', async ({ page }) => {
    const claim = new ClaimPage(page);
    const { statuses, statusIndex } = await claim.availableClaimStatuses();
    expect(statuses.length).toBeGreaterThan(0);

    for (const status of statuses) {
      await test.step(`Search claims with status ${status}`, async () => {
        await claim.selectStatus(status);
        await expect(claim.statusSelect).toHaveText(status);
        await claim.searchThroughUi();

        await claim.expectClaimsWithStatus(status, statusIndex);
        await expect(claim.heading).toBeVisible();
        await expect(page).toHaveURL(/claim\/viewAssignClaim/);
      });
    }
  });

  test('Admin can reset Employee Claims filters', async ({ page }) => {
    const claim = new ClaimPage(page);

    const eventName = await claim.selectEvent();
    await claim.selectStatus('Initiated');
    await expect(claim.eventNameSelect).toContainText(eventName);
    await expect(claim.statusSelect).toContainText('Initiated');

    await claim.resetButton.click();

    await expect(claim.eventNameSelect).toContainText('-- Select --');
    await expect(claim.statusSelect).toContainText('-- Select --');
    await expect(claim.includeSelect).toContainText('-- Select --');
    await expect(claim.heading).toBeVisible();
    await expect(page).toHaveURL(/claim\/viewAssignClaim/);
  });

  test('Admin can cancel assigning a claim', async ({ page }) => {
    const claim = new ClaimPage(page);
    const claimsCount = await claim.claimRows.count();

    await claim.openAssignClaimForm();
    await claim.fillAssignClaimForm('Claim assignment cancellation check');
    await claim.cancelAssignClaim();

    await expect(claim.assignClaimHeading).toBeHidden();
    await expect(claim.searchButton).toBeVisible();
    await expect(claim.heading).toBeVisible();
    await expect(page).toHaveURL(/claim\/viewAssignClaim/);
    await expect(claim.claimRows).toHaveCount(claimsCount);
  });
});
