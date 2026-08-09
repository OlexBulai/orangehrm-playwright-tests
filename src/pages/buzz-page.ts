import { expect, Page } from '@playwright/test';

export default class BuzzPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Buzz', exact: true });
  }

  get postInput() {
    return this.page.getByPlaceholder("What's on your mind?");
  }

  get posts() {
    return this.page.locator('.orangehrm-buzz-newsfeed-posts .orangehrm-buzz');
  }

  post(content: string) {
    return this.page.getByText(content, { exact: true }).first();
  }

  private postCard(content: string) {
    return this.posts.filter({ hasText: content }).first();
  }

  async open() {
    await this.page.getByRole('link', { name: 'Buzz', exact: true }).click();
    await expect(this.page).toHaveURL(/buzz\/viewBuzz/);
    await expect(this.heading).toBeVisible();
  }

  async createPost(content: string) {
    await this.postInput.fill(content);
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith('/api/v2/buzz/posts'),
    );
    await this.page.getByRole('button', { name: 'Post', exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const id = ((await response.json()) as { data: { post: { id: number } } })
      .data.post.id;
    await this.page.reload();
    return id;
  }

  async deletePost(content: string) {
    const post = this.post(content);
    await this.postCard(content).getByRole('button').first().click();
    await this.page.getByText('Delete Post', { exact: true }).click();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().includes('/api/v2/buzz/'),
    );
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(post).toBeHidden();
  }
}
