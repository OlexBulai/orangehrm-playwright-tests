import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type PersonalDetailsSnapshot = {
  empNumber: number;
  lastName: string;
  firstName: string;
  middleName: string;
  employeeId: string;
  otherId: string;
  drivingLicenseNo: string;
  drivingLicenseExpiredDate: string | null;
  gender: number | null;
  maritalStatus: string | null;
  birthday: string | null;
  nationality: { id: number; name: string } | null;
};

export default class PersonalDetailsApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/personal-details`;
  }

  async get(employeeId: string): Promise<PersonalDetailsSnapshot> {
    const response = await this.request.get(this.url(employeeId));
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { data: PersonalDetailsSnapshot };
    return body.data;
  }

  async restore(employeeId: string, data: PersonalDetailsSnapshot) {
    const response = await this.request.put(this.url(employeeId), {
      data: {
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName,
        employeeId: data.employeeId,
        otherId: data.otherId,
        drivingLicenseNo: data.drivingLicenseNo,
        drivingLicenseExpiredDate: data.drivingLicenseExpiredDate,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        birthday: data.birthday,
        nationalityId: data.nationality?.id ?? null,
      },
    });
    expect(response.status()).toBe(200);
  }
}
