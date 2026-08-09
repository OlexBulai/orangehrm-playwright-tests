import { test, expect } from './fixtures/shared/authenticated.fixture';
import BuzzPage from '../src/pages/buzz-page';
import { faker } from '@faker-js/faker';

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

  test(
    'Admin can create and delete a Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const content = `Automation post ${faker.string.uuid()}`;
      let postId: number | undefined;

      try {
        await buzz.open();
        postId = await buzz.createPost(content);
        await expect(buzz.post(content)).toBeVisible({ timeout: 15_000 });
        await buzz.deletePost(content);
        postId = undefined;
      } finally {
        if (postId !== undefined && (await buzz.post(content).isVisible())) {
          await buzz.deletePost(content);
        }
      }
    },
  );
});
