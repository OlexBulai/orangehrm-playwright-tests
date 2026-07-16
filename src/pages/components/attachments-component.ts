import { Download, expect, Locator, Page } from '@playwright/test';

export type AttachmentFile = {
  name: string;
  type: string;
  buffer: Buffer;
};

type ExpectedAttachment = {
  fileName: string;
  comment?: string;
};

export default class AttachmentsComponent {
  readonly page: Page;
  readonly addAttachmentButton: Locator;
  readonly fileInput: Locator;
  readonly commentInput: Locator;
  readonly saveAttachmentButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addAttachmentButton = page.getByRole('button', { name: 'Add' });
    this.fileInput = page.locator('input[type="file"]');
    this.commentInput = page.locator('textarea');
    this.saveAttachmentButton = page
      .getByRole('button', { name: 'Save' })
      .last();
    this.confirmDeleteButton = page.getByRole('button', {
      name: 'Yes, Delete',
    });
  }

  getAttachmentRow(fileName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: fileName, exact: true }),
    });
  }

  getAttachmentForm(): Locator {
    return this.page.locator('form').filter({ has: this.fileInput }).last();
  }

  async attachmentExists(fileName: string): Promise<boolean> {
    return this.getAttachmentRow(fileName).isVisible();
  }

  async openAddForm(): Promise<void> {
    await this.addAttachmentButton.click();
    await expect(this.getAttachmentForm()).toBeVisible();
  }

  async selectFile(file: AttachmentFile): Promise<void> {
    await this.fileInput.setInputFiles({
      name: file.name,
      mimeType: file.type,
      buffer: file.buffer,
    });
  }

  async fillComment(comment: string): Promise<void> {
    await this.commentInput.fill(comment);
  }

  async save(): Promise<void> {
    await this.saveAttachmentButton.click();
  }

  async addAttachment(
    file: AttachmentFile,
    comment: string,
  ): Promise<void> {
    await this.openAddForm();
    await this.selectFile(file);
    await this.fillComment(comment);
    await this.save();
    await this.expectFormHidden();
  }

  async deleteAttachment(fileName: string): Promise<void> {
    await this.getAttachmentRow(fileName)
      .locator('button:has(i.bi-trash)')
      .click();

    const deleteResponsePromise = this.page.waitForResponse((response) => {
      return (
        response.request().method() === 'DELETE' &&
        /\/api\/v2\/pim\/employees\/\d+\/screen\/personal\/attachments$/.test(
          new URL(response.url()).pathname,
        )
      );
    });

    await this.confirmDeleteButton.click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);
    await this.expectAttachmentHidden(fileName);
  }

  async editAttachment(
    currentFileName: string,
    replacementFile: AttachmentFile,
  ): Promise<void> {
    await this.getAttachmentRow(currentFileName)
      .locator('button:has(i.bi-pencil-fill)')
      .click();
    await expect(this.getAttachmentForm()).toBeVisible();
    await this.selectFile(replacementFile);
    await this.save();
    await this.expectFormHidden();
  }

  async downloadAttachment(fileName: string): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.getAttachmentRow(fileName)
      .locator('button:has(i.bi-download)')
      .click();
    return downloadPromise;
  }

  async expectAttachment({
    fileName,
    comment,
  }: ExpectedAttachment): Promise<void> {
    const row = this.getAttachmentRow(fileName);
    await expect(row).toBeVisible({ timeout: 15_000 });

    if (comment !== undefined) {
      await expect(
        row.getByRole('cell', { name: comment, exact: true }),
      ).toBeVisible();
    }
  }

  async expectAttachmentHidden(fileName: string): Promise<void> {
    await expect(this.getAttachmentRow(fileName)).toBeHidden({
      timeout: 15_000,
    });
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(
      this.getAttachmentForm().locator('.oxd-input-field-error-message'),
    ).toHaveText(message);
  }

  async expectFormHidden(): Promise<void> {
    await expect(this.getAttachmentForm()).toBeHidden({ timeout: 15_000 });
  }

  async expectAddButtonEnabled(): Promise<void> {
    await expect(this.addAttachmentButton).toBeVisible();
    await expect(this.addAttachmentButton).toBeEnabled();
  }
}
