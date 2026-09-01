import { test, expect } from './fixtures/shared/authenticated.fixture';
import BuzzPage from '../src/pages/buzz-page';
import { faker } from '@faker-js/faker';

test.describe('Buzz tests', () => {
  test.describe.configure({ timeout: 60_000 });

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
    'Admin can delete own Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const content = `Automation post ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(content);
        await expect(buzz.post(content)).toBeVisible({ timeout: 15_000 });

        await buzz.deletePost(content);
        await expect(buzz.post(content)).toBeHidden();
      } finally {
        await buzz.deletePostIfVisible(content);
      }
    },
  );

  test(
    'Admin can edit own Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const originalContent = `Original Buzz post ${faker.string.uuid()}`;
      const updatedContent = `Updated Buzz post ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(originalContent);
        await expect(buzz.post(originalContent)).toBeVisible({
          timeout: 15_000,
        });

        await buzz.editPost(originalContent, updatedContent);
        await expect(buzz.post(updatedContent)).toBeVisible({
          timeout: 15_000,
        });
        await expect(buzz.post(originalContent)).toBeHidden();
      } finally {
        await buzz.deletePostIfVisible(updatedContent, originalContent);
      }
    },
  );

  test(
    'Admin can cancel editing own Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const originalContent = `Buzz post before cancelled edit ${faker.string.uuid()}`;
      const updatedContent = `Unsaved Buzz post text ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(originalContent);
        await expect(buzz.post(originalContent)).toBeVisible({
          timeout: 15_000,
        });

        await buzz.cancelPostEditing(originalContent, updatedContent);

        await expect(buzz.editPostModal).toBeHidden();
        await expect(buzz.post(updatedContent)).toBeHidden();
        await expect(buzz.post(originalContent)).toBeVisible();
      } finally {
        await buzz.deletePostIfVisible(updatedContent, originalContent);
      }
    },
  );

  test(
    'Admin can add a comment to a Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const postContent = `Buzz post for comment ${faker.string.uuid()}`;
      const commentContent = `Buzz comment ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(postContent);
        await expect(buzz.post(postContent)).toBeVisible({ timeout: 15_000 });

        await buzz.addComment(postContent, commentContent);
        await expect(buzz.comment(postContent, commentContent)).toBeVisible();

        await buzz.deletePost(postContent);
        await expect(buzz.post(postContent)).toBeHidden();
      } finally {
        await buzz.deletePostIfVisible(postContent);
      }
    },
  );

  test(
    'Admin can delete own comment on a Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const postContent = `Buzz post for comment deletion ${faker.string.uuid()}`;
      const commentContent = `Buzz comment to delete ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(postContent);
        await expect(buzz.post(postContent)).toBeVisible({ timeout: 15_000 });

        await buzz.addComment(postContent, commentContent);
        await expect(buzz.comment(postContent, commentContent)).toBeVisible();

        await buzz.deleteComment(postContent, commentContent);
        await expect(buzz.comment(postContent, commentContent)).toBeHidden();

        await buzz.deletePost(postContent);
        await expect(buzz.post(postContent)).toBeHidden();
      } finally {
        await buzz.deletePostIfVisible(postContent);
      }
    },
  );

  test('Admin can like a Buzz post', { tag: '@mutation' }, async ({ page }) => {
    const buzz = new BuzzPage(page);
    const postContent = `Buzz post to like ${faker.string.uuid()}`;

    try {
      await buzz.open();
      await buzz.createPost(postContent);
      await expect(buzz.post(postContent)).toBeVisible({ timeout: 15_000 });
      await expect(buzz.postLikes(postContent)).toHaveText('0 Likes');

      await buzz.togglePostLike(postContent);

      await expect(buzz.postLikes(postContent)).toHaveText('1 Like');
    } finally {
      await buzz.deletePostIfVisible(postContent);
    }
  });

  test(
    'Admin can unlike a Buzz post',
    { tag: '@mutation' },
    async ({ page }) => {
      const buzz = new BuzzPage(page);
      const postContent = `Buzz post to unlike ${faker.string.uuid()}`;

      try {
        await buzz.open();
        await buzz.createPost(postContent);
        await expect(buzz.post(postContent)).toBeVisible({ timeout: 15_000 });

        await buzz.togglePostLike(postContent);
        await expect(buzz.postLikes(postContent)).toHaveText('1 Like');

        await buzz.togglePostLike(postContent);

        await expect(buzz.postLikes(postContent)).toHaveText('0 Likes');
      } finally {
        await buzz.deletePostIfVisible(postContent);
      }
    },
  );

  test('Admin cannot create an empty Buzz post', async ({ page }) => {
    const buzz = new BuzzPage(page);

    await buzz.open();
    const postsCount = await buzz.posts.count();
    await expect(buzz.postInput).toHaveValue('');

    await page.getByRole('button', { name: 'Post', exact: true }).click();

    await expect(buzz.postInput).toHaveValue('');
    await expect(buzz.posts).toHaveCount(postsCount);
  });
});
