import { test, expect } from './fixtures/shared/authenticated.fixture';
import BuzzPage from '../src/pages/buzz-page';

test.describe('Buzz tests', () => {
  test('Admin can open Buzz Newsfeed', async ({ page }) => {
    const buzz = new BuzzPage(page);

    await buzz.open();
    await expect(buzz.postInput).toBeVisible();
  });

  test('Buzz loads newsfeed data', async ({ page }) => {
    const buzz = new BuzzPage(page);
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/buzz/feed'),
    );

    await buzz.open();

    expect((await responsePromise).ok()).toBeTruthy();
  });
});
