import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import MyInfoPage from '../src/pages/my-info-page';
import { usernameLogin, passwordLogin, baseUrl } from '../env';
import MyInfoAttachmentsPage from '../src/pages/my-info-attachments-page';
import AttachmentApi from '../src/pages/api/attachment-api';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';

test.describe('OrangeHRM auth tests', () => {
  test.beforeEach('Navigate to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
  });
  test('User can add attachment', async ({ page }) => {
    const myInfoPage = new MyInfoPage(page);
    const myInfo1Page = new MyInfoAttachmentsPage(page);
    const fileName = `tc-001-${randomUUID()}.txt`;
    const comment = `TC-001 comment ${randomUUID()}`;
    const attachmentsEndpointPattern =
      /\/api\/v2\/pim\/employees\/\d+\/screen\/personal\/attachments$/;
    let attachmentCreated = false;
    let deletedViaUi = false;
    let primaryError: unknown;

    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

    try {
      const postResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          attachmentsEndpointPattern.test(response.url()),
      );
      await myInfo1Page.addAttachmentViaUi(
        {
          name: fileName,
          type: 'text/plain',
          buffer: Buffer.from('OrangeHRM TC-001 attachment'),
        },
        comment,
      );

      const postResponse = await postResponsePromise;
      expect(postResponse.status()).toBe(200);
      const responseBody = (await postResponse.json()) as {
        data: { id: number };
      };
      expect(responseBody.data.id).toEqual(expect.any(Number));
      attachmentCreated = true;

      await myInfoPage.expectAttachmentRowVisible(fileName);
      await myInfoPage.expectAttachmentDescription(fileName, comment);

      await myInfoPage.clickDeleteAttachment(fileName);
      const deleteResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          attachmentsEndpointPattern.test(response.url()),
      );
      await myInfoPage.clickConfirmDeleteButton();

      const deleteResponse = await deleteResponsePromise;
      expect(deleteResponse.status()).toBe(200);
      deletedViaUi = true;
      await myInfoPage.expectAttachmentRowHidden(fileName);
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      if (attachmentCreated && !deletedViaUi) {
        try {
          await myInfoPage.clickDeleteAttachment(fileName);
          const cleanupResponsePromise = page.waitForResponse(
            (response) =>
              response.request().method() === 'DELETE' &&
              attachmentsEndpointPattern.test(response.url()),
          );
          await myInfoPage.clickConfirmDeleteButton();
          const cleanupResponse = await cleanupResponsePromise;
          expect(cleanupResponse.status()).toBe(200);
        } catch (cleanupError) {
          if (primaryError === undefined) {
            throw cleanupError;
          }
          console.error('TC-001 UI cleanup failed:', cleanupError);
        }
      }
    }
  });

  test('User can delete attachments', async ({ page }) => {
    const myInfoPage = new MyInfoPage(page);
    const attachmentApi = new AttachmentApi(page.request);
    const fileName = `tc-002-${randomUUID()}.txt`;
    const fileBuffer = Buffer.from('OrangeHRM TC-002 attachment');
    let employeeId: string | undefined;
    let attachmentId: number | undefined;
    let deletedViaUi = false;

    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

    const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
    expect(employeeIdMatch).not.toBeNull();
    employeeId = employeeIdMatch![1];

    try {
      attachmentId = await attachmentApi.createAttachment(employeeId, {
        name: fileName,
        type: 'text/plain',
        buffer: fileBuffer,
        description: 'Created for TC-002',
      });

      const attachmentsResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          response.url().includes(
            `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
          ) &&
          response.status() === 200,
      );
      await page.reload();
      await attachmentsResponse;
      await myInfoPage.expectAttachmentRowVisible(fileName);

      await myInfoPage.clickDeleteAttachment(fileName);
      const deleteResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          response.url().includes(
            `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
          ),
      );
      await myInfoPage.clickConfirmDeleteButton();

      const deleteResponse = await deleteResponsePromise;
      expect(deleteResponse.status()).toBe(200);
      deletedViaUi = true;
      await myInfoPage.expectAttachmentRowHidden(fileName);
    } finally {
      if (
        !deletedViaUi &&
        attachmentId !== undefined &&
        employeeId !== undefined
      ) {
        await attachmentApi.deleteAttachment(employeeId, attachmentId);
      }
    }
  });

  // Known OrangeHRM demo defect: Edit Attachment shows Comment, but a changed
  // value is not sent in PUT and the previous description is preserved.
  test('User can edit attachments', async ({ page }, testInfo) => {
    testInfo.setTimeout(60_000);
    const myInfoPage = new MyInfoPage(page);
    const attachmentApi = new AttachmentApi(page.request);
    const originalFileName = `tc-003-original-${randomUUID()}.txt`;
    const replacementFileName = `tc-003-replacement-${randomUUID()}.txt`;
    let employeeId: string | undefined;
    let attachmentId: number | undefined;
    let primaryError: unknown;

    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

    const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
    expect(employeeIdMatch).not.toBeNull();
    employeeId = employeeIdMatch![1];

    try {
      attachmentId = await attachmentApi.createAttachment(employeeId, {
        name: originalFileName,
        type: 'text/plain',
        buffer: Buffer.from('OrangeHRM TC-003 original attachment'),
        description: 'Created for TC-003',
      });

      const attachmentsResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          response.url().includes(
            `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
          ) &&
          response.status() === 200,
      );
      await page.reload();
      await attachmentsResponse;
      await myInfoPage.expectAttachmentRowVisible(originalFileName);

      await myInfoPage.clickEditAttachment(originalFileName);
      await myInfoPage.replaceAttachmentFile({
        name: replacementFileName,
        type: 'text/plain',
        buffer: Buffer.from('OrangeHRM TC-003 replacement attachment'),
      });

      const updateEndpoint = `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments/${attachmentId}`;
      const updateResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'PUT' &&
          response.url() === updateEndpoint,
      );
      await myInfoPage.clickSaveAttachmentChanges();

      const updateResponse = await updateResponsePromise;
      expect(updateResponse.status()).toBe(200);

      const responseBody = (await updateResponse.json()) as {
        data: { id: number };
      };
      expect(responseBody.data.id).toEqual(expect.any(Number));
      attachmentId = responseBody.data.id;

      await myInfoPage.expectAttachmentRowVisible(replacementFileName);
      await myInfoPage.expectAttachmentRowHidden(originalFileName);
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      if (attachmentId !== undefined && employeeId !== undefined) {
        try {
          await attachmentApi.deleteAttachment(employeeId, attachmentId);
        } catch (cleanupError) {
          if (primaryError === undefined) {
            throw cleanupError;
          }
          console.error('Edit attachment cleanup failed:', cleanupError);
        }
      }
    }
  });

  test('User can download attachments', async ({ page }, testInfo) => {
    testInfo.setTimeout(60_000);
    const myInfoPage = new MyInfoPage(page);
    const attachmentApi = new AttachmentApi(page.request);
    const fileName = `tc-004-${randomUUID()}.txt`;
    const fileBuffer = Buffer.from(
      `OrangeHRM TC-004 attachment ${randomUUID()}`,
      'utf8',
    );
    let employeeId: string | undefined;
    let attachmentId: number | undefined;
    let downloadPath: string | undefined;
    let primaryError: unknown;

    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

    const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
    expect(employeeIdMatch).not.toBeNull();
    employeeId = employeeIdMatch![1];

    try {
      attachmentId = await attachmentApi.createAttachment(employeeId, {
        name: fileName,
        type: 'text/plain',
        buffer: fileBuffer,
        description: 'Created for TC-004',
      });

      const attachmentsResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          response.url().includes(
            `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
          ) &&
          response.status() === 200,
      );
      await page.reload();
      await attachmentsResponse;
      await myInfoPage.expectAttachmentRowVisible(fileName);

      const downloadPromise = page.waitForEvent('download');
      await myInfoPage.clickDownloadAttachment(fileName);
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe(fileName);
      expect(await download.failure()).toBeNull();

      downloadPath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(downloadPath);

      const downloadedBuffer = await fs.readFile(downloadPath);
      expect(downloadedBuffer.equals(fileBuffer)).toBe(true);
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      const cleanupErrors: unknown[] = [];

      if (attachmentId !== undefined && employeeId !== undefined) {
        try {
          await attachmentApi.deleteAttachment(employeeId, attachmentId);
        } catch (error) {
          cleanupErrors.push(error);
        }
      }

      if (downloadPath !== undefined) {
        try {
          await fs.rm(downloadPath, { force: true });
        } catch (error) {
          cleanupErrors.push(error);
        }
      }

      if (cleanupErrors.length > 0) {
        if (primaryError === undefined) {
          throw new AggregateError(cleanupErrors, 'TC-004 cleanup failed');
        }
        console.error('TC-004 cleanup failed:', cleanupErrors);
      }
    }
  });

  test('User can add multiple attachments', async ({ page }, testInfo) => {
    testInfo.setTimeout(60_000);
    const myInfoPage = new MyInfoPage(page);
    const myInfo1Page = new MyInfoAttachmentsPage(page);
    const attachmentApi = new AttachmentApi(page.request);
    const firstFile = {
      name: `tc-005-first-${randomUUID()}.txt`,
      type: 'text/plain',
      buffer: Buffer.from(`TC-005 first attachment ${randomUUID()}`),
    };
    const secondFile = {
      name: `tc-005-second-${randomUUID()}.txt`,
      type: 'text/plain',
      buffer: Buffer.from(`TC-005 second attachment ${randomUUID()}`),
    };
    const firstComment = `First TC-005 comment ${randomUUID()}`;
    const secondComment = `Second TC-005 comment ${randomUUID()}`;
    const attachmentIds: number[] = [];
    let employeeId: string | undefined;
    let primaryError: unknown;

    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

    const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
    expect(employeeIdMatch).not.toBeNull();
    employeeId = employeeIdMatch![1];
    const attachmentsEndpoint = `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`;

    try {
      const firstPostPromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url() === attachmentsEndpoint,
      );
      await myInfo1Page.addAttachmentViaUi(firstFile, firstComment);

      const firstPostResponse = await firstPostPromise;
      expect(firstPostResponse.status()).toBe(200);
      const firstResponseBody = (await firstPostResponse.json()) as {
        data: { id: number };
      };
      expect(firstResponseBody.data.id).toEqual(expect.any(Number));
      attachmentIds.push(firstResponseBody.data.id);

      await myInfo1Page.expectAddAttachmentFormHidden();
      await myInfoPage.expectAttachmentRowVisible(firstFile.name);
      await myInfo1Page.expectAddAttachmentButtonEnabled();

      const secondPostPromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url() === attachmentsEndpoint,
      );
      await myInfo1Page.addAttachmentViaUi(secondFile, secondComment);

      const secondPostResponse = await secondPostPromise;
      expect(secondPostResponse.status()).toBe(200);
      const secondResponseBody = (await secondPostResponse.json()) as {
        data: { id: number };
      };
      expect(secondResponseBody.data.id).toEqual(expect.any(Number));
      attachmentIds.push(secondResponseBody.data.id);

      await myInfo1Page.expectAddAttachmentFormHidden();

      await myInfoPage.expectAttachmentRowVisible(firstFile.name);
      await myInfoPage.expectAttachmentDescription(
        firstFile.name,
        firstComment,
      );
      await myInfoPage.expectAttachmentRowVisible(secondFile.name);
      await myInfoPage.expectAttachmentDescription(
        secondFile.name,
        secondComment,
      );
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      const cleanupErrors: unknown[] = [];

      if (employeeId !== undefined) {
        for (const attachmentId of attachmentIds) {
          try {
            await attachmentApi.deleteAttachment(employeeId, attachmentId);
          } catch (error) {
            cleanupErrors.push(error);
          }
        }
      }

      if (cleanupErrors.length > 0) {
        if (primaryError === undefined) {
          throw new AggregateError(cleanupErrors, 'TC-005 cleanup failed');
        }
        console.error('TC-005 cleanup failed:', cleanupErrors);
      }
    }
  });

  test('User cannot add attachment without a file', async ({
    page,
  }) => {
      const myInfoPage = new MyInfoPage(page);
      const myInfo1Page = new MyInfoAttachmentsPage(page);
      const attachmentApi = new AttachmentApi(page.request);
      const postRequests: string[] = [];
      const successfulPostBodies: Promise<{ data: { id: number } }>[] = [];
      let employeeId: string | undefined;
      let primaryError: unknown;

      await myInfoPage.openMyInfo();
      await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

      const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
      expect(employeeIdMatch).not.toBeNull();
      employeeId = employeeIdMatch![1];
      const attachmentsEndpoint = `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`;

      const trackPostRequest = (request: import('@playwright/test').Request) => {
        if (
          request.method() === 'POST' &&
          request.url() === attachmentsEndpoint
        ) {
          postRequests.push(request.url());
        }
      };
      const trackPostResponse = (
        response: import('@playwright/test').Response,
      ) => {
        if (
          response.request().method() === 'POST' &&
          response.url() === attachmentsEndpoint &&
          response.status() === 200
        ) {
          successfulPostBodies.push(response.json());
        }
      };
      page.on('request', trackPostRequest);
      page.on('response', trackPostResponse);

      try {
        await myInfo1Page.clickAddAttachment();
        await myInfo1Page.fillComment(`TC-006 no file ${randomUUID()}`);
        await myInfo1Page.clickSaveAttachment();

        await myInfo1Page.expectAttachmentValidationError('Required');
        expect(postRequests).toHaveLength(0);
      } catch (error) {
        primaryError = error;
        throw error;
      } finally {
        page.off('request', trackPostRequest);
        page.off('response', trackPostResponse);
        const cleanupErrors: unknown[] = [];
        const postBodies = await Promise.allSettled(successfulPostBodies);

        if (employeeId !== undefined) {
          for (const postBody of postBodies) {
            if (postBody.status === 'fulfilled') {
              try {
                await attachmentApi.deleteAttachment(
                  employeeId,
                  postBody.value.data.id,
                );
              } catch (error) {
                cleanupErrors.push(error);
              }
            }
          }
        }

        if (cleanupErrors.length > 0) {
          if (primaryError === undefined) {
            throw new AggregateError(
              cleanupErrors,
              'TC-006 no-file cleanup failed',
            );
          }
          console.error('TC-006 no-file cleanup failed:', cleanupErrors);
        }
      }
  });

  test('User cannot add attachment with invalid file size', async ({
    page,
  }) => {
      const myInfoPage = new MyInfoPage(page);
      const myInfo1Page = new MyInfoAttachmentsPage(page);
      const attachmentApi = new AttachmentApi(page.request);
      const oversizedFile = {
        name: `tc-006-oversized-${randomUUID()}.txt`,
        type: 'text/plain',
        buffer: Buffer.alloc(1024 * 1024 + 1, 'a'),
      };
      const postRequests: string[] = [];
      const successfulPostBodies: Promise<{ data: { id: number } }>[] = [];
      let employeeId: string | undefined;
      let primaryError: unknown;

      await myInfoPage.openMyInfo();
      await expect(page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);

      const employeeIdMatch = page.url().match(/empNumber\/(\d+)/);
      expect(employeeIdMatch).not.toBeNull();
      employeeId = employeeIdMatch![1];
      const attachmentsEndpoint = `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`;

      const trackPostRequest = (request: import('@playwright/test').Request) => {
        if (
          request.method() === 'POST' &&
          request.url() === attachmentsEndpoint
        ) {
          postRequests.push(request.url());
        }
      };
      const trackPostResponse = (
        response: import('@playwright/test').Response,
      ) => {
        if (
          response.request().method() === 'POST' &&
          response.url() === attachmentsEndpoint &&
          response.status() === 200
        ) {
          successfulPostBodies.push(response.json());
        }
      };
      page.on('request', trackPostRequest);
      page.on('response', trackPostResponse);

      try {
        await myInfo1Page.clickAddAttachment();
        await myInfo1Page.selectAttachmentFile(oversizedFile);
        await myInfo1Page.expectAttachmentValidationError(
          'Attachment Size Exceeded',
        );

        await myInfo1Page.clickSaveAttachment();
        await myInfo1Page.expectAttachmentValidationError(
          'Attachment Size Exceeded',
        );

        expect(postRequests).toHaveLength(0);
        await myInfoPage.expectAttachmentRowHidden(oversizedFile.name);
      } catch (error) {
        primaryError = error;
        throw error;
      } finally {
        page.off('request', trackPostRequest);
        page.off('response', trackPostResponse);
        const cleanupErrors: unknown[] = [];
        const postBodies = await Promise.allSettled(successfulPostBodies);

        if (employeeId !== undefined) {
          for (const postBody of postBodies) {
            if (postBody.status === 'fulfilled') {
              try {
                await attachmentApi.deleteAttachment(
                  employeeId,
                  postBody.value.data.id,
                );
              } catch (error) {
                cleanupErrors.push(error);
              }
            }
          }
        }

        if (cleanupErrors.length > 0) {
          if (primaryError === undefined) {
            throw new AggregateError(
              cleanupErrors,
              'TC-006 oversized-file cleanup failed',
            );
          }
          console.error(
            'TC-006 oversized-file cleanup failed:',
            cleanupErrors,
          );
        }
      }
  });
  
});
