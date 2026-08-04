import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type PayGradeData = {
  name: string;
};

export type PayGradeRecord = PayGradeData & {
  id: number;
  currencies?: Array<{ id: number; name: string; code: string }>;
};

export default class PayGradesApi {
  constructor(private readonly request: APIRequestContext) {}

  private get url() {
    return `${baseUrl}/api/v2/admin/pay-grades`;
  }

  async createPayGradeResponse(data: PayGradeData): Promise<APIResponse> {
    return this.request.post(this.url, { data });
  }

  async createPayGrade(data: PayGradeData): Promise<number> {
    const response = await this.createPayGradeResponse(data);
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: PayGradeRecord }).data.id;
  }

  async updatePayGrade(id: number, data: PayGradeData): Promise<void> {
    const response = await this.request.put(`${this.url}/${id}`, { data });
    expect(response.status()).toBe(200);
  }

  async getPayGrades(): Promise<PayGradeRecord[]> {
    const response = await this.request.get(this.url, {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: PayGradeRecord[] }).data;
  }

  async getPayGradeIdByName(name: string): Promise<number> {
    const record = (await this.getPayGrades()).find(
      (payGrade) => payGrade.name === name,
    );
    expect(record, `Pay Grade "${name}" was not returned by API`).toBeDefined();
    return record!.id;
  }

  async deletePayGrades(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url, { data: { ids } });
    expect([200, 404]).toContain(response.status());
  }
}
