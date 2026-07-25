import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

type TotalResponse = { meta: { total: number } };
type CustomFieldsResponse = { meta: { fields: unknown[] } };

export default class SalaryApi {
  constructor(private readonly request: APIRequestContext) {}

  private employeeUrl(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}`;
  }

  async getSalaryComponentCount(employeeId: string): Promise<number> {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/salary-components`,
      { params: { limit: 50, offset: 0 } },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as TotalResponse).meta.total;
  }

  async getCustomFieldCount(employeeId: string): Promise<number> {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/custom-fields`,
      { params: { screen: 'salary' } },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as CustomFieldsResponse).meta.fields.length;
  }

}
