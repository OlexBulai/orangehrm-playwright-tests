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

  get editPostModal() {
    return this.page.getByRole('dialog').filter({ hasText: 'Edit Post' });
  }

  post(content: string) {
    return this.page.getByText(content, { exact: true }).first();
  }

  comment(postContent: string, commentContent: string) {
    return this.postCard(postContent)
      .locator('.orangehrm-comment-wrapper')
      .getByText(commentContent, { exact: true });
  }

  postLikes(postContent: string) {
    return this.postCard(postContent).getByText(/^\d+ Likes?$/);
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

  async editPost(currentContent: string, updatedContent: string) {
    await this.postCard(currentContent).getByRole('button').first().click();
    await this.page.getByText('Edit Post', { exact: true }).click();

    await this.editPostModal.getByRole('textbox').fill(updatedContent);
    await this.editPostModal
      .getByRole('button', { name: 'Post', exact: true })
      .click();
  }

  async cancelPostEditing(currentContent: string, updatedContent: string) {
    await this.postCard(currentContent).getByRole('button').first().click();
    await this.page.getByText('Edit Post', { exact: true }).click();
    await this.editPostModal.getByRole('textbox').fill(updatedContent);
    await this.editPostModal.getByRole('button').first().click();
  }

  async addComment(postContent: string, commentContent: string) {
    const postCard = this.postCard(postContent);
    await postCard.getByText(/^\d+ Comments?$/).click();
    const commentInput = postCard.locator('.orangehrm-buzz-comment-add input');
    await commentInput.fill(commentContent);
    await commentInput.press('Enter');
  }

  async deleteComment(postContent: string, commentContent: string) {
    const comment = this.postCard(postContent)
      .locator('.orangehrm-comment-wrapper')
      .filter({ hasText: commentContent });
    await comment.getByText('Delete', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
  }

  async togglePostLike(postContent: string) {
    await this.postCard(postContent).locator('.orangehrm-heart-icon').click();
  }

  async deletePostIfVisible(...contents: string[]) {
    if (this.page.isClosed()) return;

    const openDialog = this.page.getByRole('dialog').last();
    if (await openDialog.isVisible()) {
      await openDialog.getByRole('button').first().click();
    }

    for (const content of contents) {
      if (await this.post(content).isVisible()) {
        await this.deletePost(content);
        return;
      }
    }
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
