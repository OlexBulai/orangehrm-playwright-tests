import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

type AttachmentFile = {
  name: string;
  type: string;
  buffer: Buffer;
  description?: string;
};

type CreateAttachmentResponse = {
  data: {
    id: number;
  };
};

export default class AttachmentApi {
  constructor(private readonly request: APIRequestContext) {}

  async createAttachment(employeeId: string, file: AttachmentFile) {
    const response = await this.request.post(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
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

  async deleteAttachment(employeeId: string, attachmentId: number) {
    const response = await this.request.delete(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/screen/personal/attachments`,
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
}
