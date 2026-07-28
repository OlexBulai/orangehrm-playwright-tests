import { randomUUID } from 'crypto';
import { test } from '../fixtures/my-info/attachments.fixture';
import {
  createAttachmentFile,
  verifyDownloadedAttachment,
} from '../helpers/my-info/attachment-test-helpers';

test.describe('My Info attachment tests', { tag: '@mutation' }, () => {
  test.describe.configure({ mode: 'serial' });
  test('User can add attachment', async ({ myInfoPage, attachmentCleanup }) => {
    const file = createAttachmentFile({
      prefix: 'add-attachment',
      content: 'Attachment created for add test',
    });
    const comment = `Add attachment comment ${randomUUID()}`;
    attachmentCleanup.trackUi(file.name);

    await myInfoPage.attachments.addAttachment(file, comment);

    await myInfoPage.attachments.expectAttachment({
      fileName: file.name,
      comment,
    });
  });

  test('User can delete attachments', async ({
    myInfoPage,
    attachmentSetup,
    attachmentCleanup,
  }) => {
    const file = createAttachmentFile({
      prefix: 'delete-attachment',
      content: 'Attachment created for delete test',
      description: 'Attachment prepared for delete test',
    });
    const attachmentId = await attachmentSetup.create(file);

    await myInfoPage.attachments.deleteAttachment(file.name);
    attachmentCleanup.forgetApi(attachmentId);
  });

  test('User can edit attachments', async ({
    myInfoPage,
    attachmentSetup,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const originalFile = createAttachmentFile({
      prefix: 'edit-original-attachment',
      content: 'Original attachment prepared for edit test',
      description: 'Attachment prepared for edit test',
    });
    const replacementFile = createAttachmentFile({
      prefix: 'edit-replacement-attachment',
      content: 'Replacement attachment created for edit test',
    });
    await attachmentSetup.create(originalFile);

    await myInfoPage.attachments.editAttachment(
      originalFile.name,
      replacementFile,
    );

    await myInfoPage.attachments.expectAttachment({
      fileName: replacementFile.name,
    });
    await myInfoPage.attachments.expectAttachmentHidden(originalFile.name);
  });

  test('User can download attachments', async ({
    page,
    myInfoPage,
    attachmentSetup,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const file = createAttachmentFile({
      prefix: 'download-attachment',
      content: `Attachment created for download test ${randomUUID()}`,
      description: 'Attachment prepared for download test',
    });
    const attachmentId = await attachmentSetup.create(file);

    const download = await myInfoPage.attachments.downloadAttachment(file.name);

    await verifyDownloadedAttachment({
      page,
      download,
      attachmentId,
      file,
      outputPath: testInfo.outputPath(file.name),
    });
  });

  test('User can add multiple attachments', async ({
    myInfoPage,
    attachmentCleanup,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const firstFile = createAttachmentFile({
      prefix: 'multiple-attachment-first',
    });
    const secondFile = createAttachmentFile({
      prefix: 'multiple-attachment-second',
    });
    const firstComment = `First multiple attachment comment ${randomUUID()}`;
    const secondComment = `Second multiple attachment comment ${randomUUID()}`;
    attachmentCleanup.trackUi(firstFile.name);
    attachmentCleanup.trackUi(secondFile.name);

    await myInfoPage.attachments.addAttachment(firstFile, firstComment);
    await myInfoPage.attachments.expectAttachment({
      fileName: firstFile.name,
      comment: firstComment,
    });
    await myInfoPage.attachments.expectAddButtonEnabled();

    await myInfoPage.attachments.addAttachment(secondFile, secondComment);

    await myInfoPage.attachments.expectAttachment({
      fileName: firstFile.name,
      comment: firstComment,
    });
    await myInfoPage.attachments.expectAttachment({
      fileName: secondFile.name,
      comment: secondComment,
    });
  });

  test('User cannot add attachment without a file', async ({ myInfoPage }) => {
    await myInfoPage.attachments.openAddForm();
    await myInfoPage.attachments.fillComment(
      `No file validation comment ${randomUUID()}`,
    );
    await myInfoPage.attachments.saveAttachment();
    await myInfoPage.attachments.expectValidationError('Required');
  });

  test('User cannot add attachment with invalid file size', async ({
    myInfoPage,
  }) => {
    const oversizedFile = {
      name: `oversized-attachment-${randomUUID()}.txt`,
      type: 'text/plain',
      buffer: Buffer.alloc(1024 * 1024 + 1, 'a'),
    };

    await myInfoPage.attachments.openAddForm();
    await myInfoPage.attachments.selectFile(oversizedFile);
    await myInfoPage.attachments.expectValidationError(
      'Attachment Size Exceeded',
    );

    await myInfoPage.attachments.saveAttachment();
    await myInfoPage.attachments.expectValidationError(
      'Attachment Size Exceeded',
    );
    await myInfoPage.attachments.expectAttachmentHidden(oversizedFile.name);
  });
});
