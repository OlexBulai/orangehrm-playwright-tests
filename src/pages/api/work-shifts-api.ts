import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type WorkShiftData = {
  name: string;
  startTime: string;
  endTime: string;
  hoursPerDay: string;
  empNumbers: number[];
};

export type WorkShiftRecord = Omit<
  WorkShiftData,
  'hoursPerDay' | 'empNumbers'
> & {
  id: number;
  hoursPerDay: number;
};

export default class WorkShiftsApi {
  constructor(private readonly request: APIRequestContext) {}
  private get url(): string {
    return `${baseUrl}/api/v2/admin/work-shifts`;
  }

  async createWorkShift(data: WorkShiftData): Promise<number> {
    const response = await this.request.post(this.url, { data });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: WorkShiftRecord }).data.id;
  }

  async getWorkShifts(): Promise<WorkShiftRecord[]> {
    const response = await this.request.get(this.url, {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: WorkShiftRecord[] }).data;
  }

  async getWorkShiftIdByName(name: string): Promise<number> {
    const record = (await this.getWorkShifts()).find(
      (shift) => shift.name === name,
    );
    expect(
      record,
      `Work Shift "${name}" was not returned by API`,
    ).toBeDefined();
    return record!.id;
  }

  async deleteWorkShifts(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url, { data: { ids } });
    expect([200, 404]).toContain(response.status());
  }
}
