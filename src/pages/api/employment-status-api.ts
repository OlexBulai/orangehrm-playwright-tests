import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type EmploymentStatusData = {
  name: string;
};

export type EmploymentStatusRecord = EmploymentStatusData & {
  id: number;
};

export default class EmploymentStatusApi {
  constructor(private readonly request: APIRequestContext) {}

  private get url(): string {
    return `${baseUrl}/api/v2/admin/employment-statuses`;
  }

  async createEmploymentStatusResponse(
    data: EmploymentStatusData,
  ): Promise<APIResponse> {
    return this.request.post(this.url, { data });
  }

  async createEmploymentStatus(data: EmploymentStatusData): Promise<number> {
    const response = await this.createEmploymentStatusResponse(data);
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: EmploymentStatusRecord }).data
      .id;
  }

  async updateEmploymentStatus(
    id: number,
    data: EmploymentStatusData,
  ): Promise<void> {
    const response = await this.request.put(`${this.url}/${id}`, { data });
    expect(response.status()).toBe(200);
  }

  async getEmploymentStatuses(): Promise<EmploymentStatusRecord[]> {
    const response = await this.request.get(this.url, {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: EmploymentStatusRecord[] }).data;
  }

  async getEmploymentStatusIdByName(name: string): Promise<number> {
    const record = (await this.getEmploymentStatuses()).find(
      (status) => status.name === name,
    );
    expect(
      record,
      `Employment Status "${name}" was not returned by API`,
    ).toBeDefined();
    return record!.id;
  }

  async deleteEmploymentStatuses(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url, { data: { ids } });
    expect([200, 404]).toContain(response.status());
  }
}
