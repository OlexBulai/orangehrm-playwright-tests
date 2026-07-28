import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { JobDetails } from '../components/job-component';

type JobDetailsResponse = { data: JobDetails };

export default class JobApi {
  constructor(private readonly request: APIRequestContext) {}

  async getDetails(employeeId: string): Promise<JobDetails> {
    const response = await this.request.get(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/job-details`,
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as JobDetailsResponse).data;
  }
}
