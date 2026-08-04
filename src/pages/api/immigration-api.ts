import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { ImmigrationDocumentData } from '../components/immigration-component';

type ImmigrationResponse = {
  data: { id: string };
};

export type ImmigrationRecord = {
  id: number | string;
  number: string;
  type: number;
};

function toApiDate(uiDate: string): string {
  if (uiDate === '') return '';
  const [year, day, month] = uiDate.split('-');
  return `${year}-${month}-${day}`;
}

export default class ImmigrationApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/immigrations`;
  }

  private payload(data: ImmigrationDocumentData) {
    return {
      number: data.number,
      issuedDate: toApiDate(data.issuedDate),
      expiryDate: toApiDate(data.expiryDate),
      type: data.documentType === 'Passport' ? 1 : 2,
      status: data.eligibleStatus,
      reviewDate: toApiDate(data.eligibleReviewDate),
      countryCode: data.issuedBy.code,
      comment: data.comments,
    };
  }

  async createResponse(
    employeeId: string,
    data: ImmigrationDocumentData,
  ): Promise<APIResponse> {
    return this.request.post(this.url(employeeId), {
      data: this.payload(data),
    });
  }

  async create(employeeId: string, data: ImmigrationDocumentData) {
    const response = await this.createResponse(employeeId, data);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as ImmigrationResponse;
    return Number(body.data.id);
  }

  async getAll(employeeId: string): Promise<ImmigrationRecord[]> {
    const response = await this.request.get(this.url(employeeId), {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: ImmigrationRecord[] }).data;
  }

  async update(employeeId: string, id: number, data: ImmigrationDocumentData) {
    const response = await this.request.put(`${this.url(employeeId)}/${id}`, {
      data: this.payload(data),
    });
    expect(response.status()).toBe(200);
  }

  async delete(employeeId: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url(employeeId), {
      data: { ids },
    });
    expect(response.status()).toBe(200);
  }
}
