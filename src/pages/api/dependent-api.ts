import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { DependentData } from '../components/dependents-component';

type DependentResponse = {
  data: { id: string };
};

function toApiDate(uiDate: string): string {
  const [year, day, month] = uiDate.split('-');
  return `${year}-${month}-${day}`;
}

export default class DependentApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/dependents`;
  }

  async create(employeeId: string, data: DependentData) {
    const response = await this.request.post(this.url(employeeId), {
      data: {
        name: data.name,
        relationshipType: data.relationshipType.toLowerCase(),
        relationship:
          data.relationshipType === 'Other' ? data.relationship ?? '' : '',
        dateOfBirth: toApiDate(data.dateOfBirth),
      },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as DependentResponse;
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
