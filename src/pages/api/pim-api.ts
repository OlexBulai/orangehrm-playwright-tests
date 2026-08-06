import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type PimEmployeeData = {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
};

export type PimEmployeeRecord = PimEmployeeData & {
  empNumber: number;
};

export default class PimApi {
  constructor(private readonly request: APIRequestContext) {}

  private get employeesUrl() {
    return `${baseUrl}/api/v2/pim/employees`;
  }

  async createEmployee(data: PimEmployeeData): Promise<number> {
    const response = await this.request.post(this.employeesUrl, { data });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: PimEmployeeRecord }).data
      .empNumber;
  }

  async getEmployeeByEmployeeId(
    employeeId: string,
  ): Promise<PimEmployeeRecord | undefined> {
    const response = await this.request.get(this.employeesUrl, {
      params: { limit: 50, offset: 0, employeeId },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: PimEmployeeRecord[] };
    return body.data.find((employee) => employee.employeeId === employeeId);
  }

  async updateEmployee(
    employeeNumber: number,
    data: PimEmployeeData,
  ): Promise<void> {
    const response = await this.request.put(
      `${this.employeesUrl}/${employeeNumber}/personal-details`,
      {
        data: {
          ...data,
          otherId: '',
          drivingLicenseNo: '',
          drivingLicenseExpiredDate: null,
          gender: 1,
          maritalStatus: 'Single',
          birthday: null,
          nationalityId: 1,
        },
      },
    );
    expect(response.status(), await response.text()).toBe(200);
  }

  async deleteEmployees(employeeNumbers: number[]): Promise<void> {
    if (employeeNumbers.length === 0) return;
    const response = await this.request.delete(this.employeesUrl, {
      data: { ids: employeeNumbers },
    });
    expect([200, 404]).toContain(response.status());
  }
}
