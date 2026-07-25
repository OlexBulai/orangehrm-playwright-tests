import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { ReportingRelation } from '../components/report-to-component';

type RelationsResponse = { data: ReportingRelation[] };
type CustomFieldsResponse = { meta: { fields: unknown[] } };

export default class ReportToApi {
  constructor(private readonly request: APIRequestContext) {}

  private employeeUrl(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}`;
  }

  async getSupervisors(employeeId: string): Promise<ReportingRelation[]> {
    return this.getRelations(employeeId, 'supervisors');
  }

  async getSubordinates(employeeId: string): Promise<ReportingRelation[]> {
    return this.getRelations(employeeId, 'subordinates');
  }

  async getCustomFieldCount(employeeId: string): Promise<number> {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/custom-fields`,
      { params: { screen: 'report-to' } },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as CustomFieldsResponse).meta.fields.length;
  }

  private async getRelations(
    employeeId: string,
    relation: 'supervisors' | 'subordinates',
  ): Promise<ReportingRelation[]> {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/${relation}`,
      { params: { limit: 50, offset: 0 } },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as RelationsResponse).data;
  }
}
