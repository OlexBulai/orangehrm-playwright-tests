import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { EmergencyContactData } from '../components/emergency-contacts-component';

type EmergencyContactResponse = {
  data: { id: string };
};

export default class EmergencyContactApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(employeeId: string, data: EmergencyContactData) {
    const response = await this.request.post(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/emergency-contacts`,
      {
        data: {
          name: data.name,
          relationship: data.relationship,
          homePhone: data.homePhone,
          mobilePhone: data.mobilePhone,
          officePhone: data.workPhone,
        },
      },
    );
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EmergencyContactResponse;
    return Number(body.data.id);
  }

  async delete(employeeId: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/emergency-contacts`,
      { data: { ids } },
    );
    expect(response.status()).toBe(200);
  }
}
