import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { AttachmentData } from '../../types/attachment';

type CreateAttachmentResponse = {
  data: {
    id: number;
  };
};

type AttachmentListResponse = { meta: { total: number } };

export type AttachmentScreen =
  | 'personal'
  | 'job'
  | 'salary'
  | 'report-to'
  | 'qualifications'
  | 'membership';

export type AttachmentRecord = {
  id: number;
  description: string;
  filename: string;
};

export default class AttachmentApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string, screen: AttachmentScreen) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/${screen}/attachments`;
  }

  async createAttachment(
    employeeId: string,
    file: AttachmentData,
    screen: AttachmentScreen = 'personal',
  ) {
    const response = await this.request.post(
      this.url(employeeId, screen),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          attachment: {
            name: file.name,
            type: file.type,
            size: file.buffer.length,
            base64: file.buffer.toString('base64'),
          },
          description: file.description ?? '',
        },
      },
    );

    expect(response.status()).toBe(200);
    const responseBody = (await response.json()) as CreateAttachmentResponse;
    return responseBody.data.id;
  }

  async deleteAttachment(
    employeeId: string,
    attachmentId: number,
    screen: AttachmentScreen = 'personal',
  ) {
    const response = await this.request.delete(
      this.url(employeeId, screen),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: { ids: [attachmentId] },
      },
    );

    expect(response.status()).toBe(200);
  }

  async getCount(employeeId: string, screen: AttachmentScreen) {
    const body = await this.getAll(employeeId, screen);
    return body.meta.total;
  }

  async getAll(employeeId: string, screen: AttachmentScreen) {
    const response = await this.request.get(this.url(employeeId, screen), {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return (await response.json()) as AttachmentListResponse & {
      data: AttachmentRecord[];
    };
  }
}
