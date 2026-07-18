import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { ImmigrationDocumentData } from '../components/immigration-component';

type ImmigrationResponse = {
  data: { id: string };
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

  async create(employeeId: string, data: ImmigrationDocumentData) {
    const response = await this.request.post(this.url(employeeId), {
      data: {
        number: data.number,
        issuedDate: toApiDate(data.issuedDate),
        expiryDate: toApiDate(data.expiryDate),
        type: data.documentType === 'Passport' ? 1 : 2,
        status: data.eligibleStatus,
        reviewDate: toApiDate(data.eligibleReviewDate),
        countryCode: data.issuedBy.code,
        comment: data.comments,
      },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as ImmigrationResponse;
    return Number(body.data.id);
  }

  async delete(employeeId: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url(employeeId), {
      data: { ids },
    });
    expect(response.status()).toBe(200);
  }
}
