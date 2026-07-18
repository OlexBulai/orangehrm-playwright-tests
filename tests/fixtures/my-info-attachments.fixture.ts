import { expect, test as base } from './my-info.fixture';
import { AttachmentData } from '../../src/types/attachment';

export type AttachmentCleanup = {
  trackApi(attachmentId: number): void;
  forgetApi(attachmentId: number): void;
  trackUi(fileName: string): void;
  forgetUi(fileName: string): void;
};

type AttachmentSetupFile = AttachmentData & { description: string };

export type AttachmentSetup = {
  create(file: AttachmentSetupFile): Promise<number>;
};

type MyInfoAttachmentsFixtures = {
  attachmentCleanup: AttachmentCleanup;
  attachmentSetup: AttachmentSetup;
};

export const test = base.extend<MyInfoAttachmentsFixtures>({
  attachmentCleanup: async (
    { attachmentApi, employeeId },
    use,
    testInfo,
  ) => {
    const apiAttachmentIds = new Set<number>();
    const uiFileNames = new Set<string>();
    const cleanup: AttachmentCleanup = {
      trackApi: (attachmentId) => apiAttachmentIds.add(attachmentId),
      forgetApi: (attachmentId) => apiAttachmentIds.delete(attachmentId),
      trackUi: (fileName) => uiFileNames.add(fileName),
      forgetUi: (fileName) => uiFileNames.delete(fileName),
    };
    let primaryError: unknown;

    try {
      await use(cleanup);
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      const cleanupErrors: unknown[] = [];

      try {
        const attachments = await attachmentApi.getAll(employeeId, 'personal');
        for (const attachment of attachments.data) {
          if (uiFileNames.has(attachment.filename)) {
            apiAttachmentIds.add(attachment.id);
          }
        }
      } catch (error) {
        cleanupErrors.push(error);
      }

      for (const attachmentId of apiAttachmentIds) {
        try {
          await attachmentApi.deleteAttachment(employeeId, attachmentId);
        } catch (error) {
          cleanupErrors.push(error);
        }
      }

      if (cleanupErrors.length > 0) {
        const testAlreadyFailed =
          primaryError !== undefined ||
          testInfo.status !== testInfo.expectedStatus;

        if (testAlreadyFailed) {
          console.error('Attachment cleanup failed:', cleanupErrors);
        } else {
          throw new AggregateError(
            cleanupErrors,
            'Attachment cleanup failed',
          );
        }
      }
    }
  },

  attachmentSetup: async (
    {
      page,
      myInfoPage,
      attachmentApi,
      employeeId,
      attachmentCleanup,
    },
    use,
  ) => {
    await use({
      create: async (file) => {
        const attachmentId = await attachmentApi.createAttachment(
          employeeId,
          file,
        );
        attachmentCleanup.trackApi(attachmentId);

        await page.reload();
        await myInfoPage.attachments.expectAttachment({
          fileName: file.name,
          comment: file.description,
        });

        return attachmentId;
      },
    });
  },
});

export { expect };
