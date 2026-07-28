import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type JobCategoryData = { name: string };
export type JobCategoryRecord = JobCategoryData & { id: number };

export default class JobCategoriesApi {
  constructor(private readonly request: APIRequestContext) {}

  private get url(): string {
    return `${baseUrl}/api/v2/admin/job-categories`;
  }

  async createJobCategory(data: JobCategoryData): Promise<number> {
    const response = await this.request.post(this.url, { data });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: JobCategoryRecord }).data.id;
  }

  async getJobCategories(): Promise<JobCategoryRecord[]> {
    const response = await this.request.get(this.url, {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: JobCategoryRecord[] }).data;
  }

  async getJobCategoryIdByName(name: string): Promise<number> {
    const record = (await this.getJobCategories()).find(
      (category) => category.name === name,
    );
    expect(
      record,
      `Job Category "${name}" was not returned by API`,
    ).toBeDefined();
    return record!.id;
  }

  async deleteJobCategories(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url, { data: { ids } });
    expect([200, 404]).toContain(response.status());
  }
}
