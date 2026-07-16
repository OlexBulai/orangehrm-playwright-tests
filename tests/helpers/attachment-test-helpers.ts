import { Download, expect, Page } from '@playwright/test';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';

type CreateAttachmentFileOptions = {
  prefix: string;
  content?: string;
  description?: string;
  type?: string;
  extension?: string;
};

type CreateAttachmentFileWithDescriptionOptions =
  CreateAttachmentFileOptions & {
    description: string;
  };

export type TestAttachmentFile = {
  name: string;
  type: string;
  buffer: Buffer;
  description?: string;
};

type VerifyDownloadedAttachmentOptions = {
  page: Page;
  download: Download;
  attachmentId: number;
  file: TestAttachmentFile;
  outputPath: string;
};

export function createAttachmentFile(
  options: CreateAttachmentFileWithDescriptionOptions,
): TestAttachmentFile & { description: string };

export function createAttachmentFile(
  options: CreateAttachmentFileOptions,
): TestAttachmentFile;

export function createAttachmentFile({
  prefix,
  content = `OrangeHRM attachment ${randomUUID()}`,
  description,
  type = 'text/plain',
  extension = 'txt',
}: CreateAttachmentFileOptions): TestAttachmentFile {
  return {
    name: `${prefix}-${randomUUID()}.${extension}`,
    type,
    buffer: Buffer.from(content, 'utf8'),
    description,
  };
}

export function getFileNameFromContentDisposition(
  header: string | undefined,
): string {
  if (header === undefined) {
    throw new Error('Content-Disposition header is missing');
  }

  const encodedFileName = header.match(
    /filename\*\s*=\s*utf-8''([^;]+)/i,
  )?.[1];

  if (encodedFileName === undefined) {
    throw new Error(
      `Content-Disposition header does not contain filename*: ${header}`,
    );
  }

  try {
    return decodeURIComponent(encodedFileName);
  } catch (error) {
    throw new Error(
      `Content-Disposition filename* is not valid URL-encoded text: ${encodedFileName}`,
      { cause: error },
    );
  }
}

export async function verifyDownloadedAttachment({
  page,
  download,
  attachmentId,
  file,
  outputPath,
}: VerifyDownloadedAttachmentOptions): Promise<void> {
  expect(download.url()).toContain(`/attachId/${attachmentId}`);
  expect(await download.failure()).toBeNull();

  const downloadResponse = await page.request.get(download.url());
  expect(downloadResponse.status()).toBe(200);

  const downloadedFileName = getFileNameFromContentDisposition(
    downloadResponse.headers()['content-disposition'],
  );
  expect(downloadedFileName).toBe(file.name);

  let primaryError: unknown;

  try {
    await download.saveAs(outputPath);
    const downloadedBuffer = await fs.readFile(outputPath);
    expect(downloadedBuffer.equals(file.buffer)).toBe(true);
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await fs.rm(outputPath, { force: true });
    } catch (cleanupError) {
      if (primaryError === undefined) {
        throw cleanupError;
      }
      console.error('Downloaded file cleanup failed:', cleanupError);
    }
  }
}
