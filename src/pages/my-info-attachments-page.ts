import { Page, Locator, expect } from '@playwright/test';

export default class MyInfoAttachmentsPage {
  readonly page: Page;
  readonly myInfoLink: Locator;
  readonly addAttachmentButton: Locator;
  readonly fileInput: Locator;
  readonly commentInput: Locator;
  readonly saveAttachmentButton: Locator;
  readonly deleteAttachmentButton: Locator;
  readonly redactAttachmentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myInfoLink = page.getByRole('link', { name: 'My Info' });
    this.addAttachmentButton = page.getByRole('button', { name: 'Add' });
    this.fileInput = page.locator('input[type="file"]');
    this.commentInput = page.getByLabel('Comment');
    this.saveAttachmentButton = page
      .getByRole('button', { name: 'Save' })
      .last();
    this.commentInput = page.locator('textarea');
    this.deleteAttachmentButton = page.locator('button:has(i.bi-trash)');
    this.redactAttachmentButton = page.locator('button:has(i.bi-pencil)');
    
  }

  async clickAddAttachment() {
    await this.addAttachmentButton.click();
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  async fillComment(comment: string) {
    await this.commentInput.fill(comment);
  }

  async clickSaveAttachment() {
    await this.saveAttachmentButton.click();
  }

  async addAttachmentViaUi(
    file: { name: string; type: string; buffer: Buffer },
    comment: string,
  ) {
    await this.clickAddAttachment();
    await this.fileInput.setInputFiles({
      name: file.name,
      mimeType: file.type,
      buffer: file.buffer,
    });
    await this.fillComment(comment);
    await this.clickSaveAttachment();
  }

  getAddAttachmentForm() {
    return this.page
      .locator('form')
      .filter({ has: this.fileInput })
      .last();
  }

  async selectAttachmentFile(file: {
    name: string;
    type: string;
    buffer: Buffer;
  }) {
    await this.fileInput.setInputFiles({
      name: file.name,
      mimeType: file.type,
      buffer: file.buffer,
    });
  }

  async expectAttachmentValidationError(message: string) {
    await expect(
      this.getAddAttachmentForm().locator(
        '.oxd-input-field-error-message',
      ),
    ).toHaveText(message);
  }

  async expectAddAttachmentFormHidden() {
    await expect(this.getAddAttachmentForm()).toBeHidden({
      timeout: 15_000,
    });
  }

  async expectAddAttachmentButtonEnabled() {
    await expect(this.addAttachmentButton).toBeVisible();
    await expect(this.addAttachmentButton).toBeEnabled();
  }

  async clickDeleteAttachment(fileName: string) {
  const row = this.page
    .getByRole('row')
    .filter({ hasText: fileName });

  await row.locator('button:has(i.bi-trash)').click();
  }
  async clickRedactAttachment(fileName: string) {
    const row = this.page
      .getByRole('row')
      .filter({ hasText: fileName });

    await row.locator('button:has(i.bi-pencil)').click();
  }
}
