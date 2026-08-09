import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export default class PerformanceApi {
  constructor(private readonly request: APIRequestContext) {}

  async deleteTrackers(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    const response = await this.request.delete(
      `${baseUrl}/api/v2/performance/config/trackers`,
      { data: { ids } },
    );

    expect([200, 404]).toContain(response.status());
  }
}
