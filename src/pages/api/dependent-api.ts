import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { DependentData } from '../components/dependents-component';

type DependentResponse = {
  data: { id: string };
};

export type DependentRecord = {
  id: number | string;
  name: string;
  relationshipType: string;
  relationship: string | null;
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

  private payload(data: DependentData) {
    return {
      name: data.name,
      relationshipType: data.relationshipType.toLowerCase(),
      relationship:
        data.relationshipType === 'Other' ? (data.relationship ?? '') : '',
      dateOfBirth: toApiDate(data.dateOfBirth),
    };
  }

  async createResponse(
    employeeId: string,
    data: DependentData,
  ): Promise<APIResponse> {
    return this.request.post(this.url(employeeId), {
      data: this.payload(data),
    });
  }

  async create(employeeId: string, data: DependentData) {
    const response = await this.createResponse(employeeId, data);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as DependentResponse;
    return Number(body.data.id);
  }

  async getAll(employeeId: string): Promise<DependentRecord[]> {
    const response = await this.request.get(this.url(employeeId), {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: DependentRecord[] }).data;
  }

  async update(employeeId: string, id: number, data: DependentData) {
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
