import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type JobTitleData = {
  title: string;
  description: string;
  note: string;
};

export type JobTitleRecord = {
  id: number;
  title: string;
  description: string | null;
  note: string | null;
};

export default class JobTitlesApi {
  constructor(private readonly request: APIRequestContext) {}

  private get url() {
    return `${baseUrl}/api/v2/admin/job-titles`;
  }

  async createJobTitle(data: JobTitleData) {
    const response = await this.request.post(this.url, {
      data: { ...data, specification: null },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: JobTitleRecord }).data.id;
  }

  async getJobTitles() {
    const response = await this.request.get(this.url, {
      params: {
        limit: 50,
        offset: 0,
        sortField: 'jt.jobTitleName',
        sortOrder: 'ASC',
      },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: JobTitleRecord[] }).data;
  }

  async deleteJobTitles(ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url, { data: { ids } });
    expect([200, 404]).toContain(response.status());
  }
}
