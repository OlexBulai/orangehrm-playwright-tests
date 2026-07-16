import { expect, test as base } from '@playwright/test';
import { passwordLogin, usernameLogin } from '../../env';
import AttachmentApi from '../../src/pages/api/attachment-api';
import LoginPage from '../../src/pages/login-page';
import MyInfoPage from '../../src/pages/my-info-page';

export type AttachmentCleanup = {
  trackApi(attachmentId: number): void;
  forgetApi(attachmentId: number): void;
  trackUi(fileName: string): void;
  forgetUi(fileName: string): void;
};

type AttachmentSetupFile = {
  name: string;
  type: string;
  buffer: Buffer;
  description: string;
};

export type AttachmentSetup = {
  create(file: AttachmentSetupFile): Promise<number>;
};

type MyInfoAttachmentsFixtures = {
  myInfoPage: MyInfoPage;
  attachmentApi: AttachmentApi;
  employeeId: string;
  attachmentCleanup: AttachmentCleanup;
  attachmentSetup: AttachmentSetup;
};

export const test = base.extend<MyInfoAttachmentsFixtures>({
  myInfoPage: [
    async ({ page }, use) => {
      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.fillUsername(usernameLogin);
      await loginPage.fillPassword(passwordLogin);
      await loginPage.clickLoginButton();

      const myInfoPage = new MyInfoPage(page);
      await myInfoPage.openMyInfo();
      await use(myInfoPage);
    },
    { timeout: 60_000 },
  ],

  attachmentApi: async ({ page }, use) => {
    await use(new AttachmentApi(page.request));
  },

  employeeId: async ({ myInfoPage }, use) => {
    await use(myInfoPage.getEmployeeId());
  },

  attachmentCleanup: async (
    { myInfoPage, attachmentApi, employeeId },
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

      for (const fileName of uiFileNames) {
        try {
          if (await myInfoPage.attachments.attachmentExists(fileName)) {
            await myInfoPage.attachments.deleteAttachment(fileName);
          }
        } catch (error) {
          cleanupErrors.push(error);
        }
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
