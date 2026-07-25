import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export default class AdminSectionsApi {
  constructor(private readonly request: APIRequestContext) {}

  async expectEndpointAvailable(endpoint: string): Promise<void> {
    const response = await this.request.get(`${baseUrl}${endpoint}`);
    expect(response.status()).toBe(200);
  }
}
