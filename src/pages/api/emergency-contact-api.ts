import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { EmergencyContactData } from '../components/emergency-contacts-component';

type EmergencyContactResponse = {
  data: { id: string };
};

export type EmergencyContactRecord = {
  id: number | string;
  name: string;
  relationship: string;
  homePhone: string;
  mobilePhone: string;
  officePhone: string;
};

export default class EmergencyContactApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/emergency-contacts`;
  }

  private payload(data: EmergencyContactData) {
    return {
      name: data.name,
      relationship: data.relationship,
      homePhone: data.homePhone,
      mobilePhone: data.mobilePhone,
      officePhone: data.workPhone,
    };
  }

  async createResponse(
    employeeId: string,
    data: EmergencyContactData,
  ): Promise<APIResponse> {
    return this.request.post(this.url(employeeId), {
      data: this.payload(data),
    });
  }

  async create(employeeId: string, data: EmergencyContactData) {
    const response = await this.createResponse(employeeId, data);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as EmergencyContactResponse;
    return Number(body.data.id);
  }

  async getAll(employeeId: string): Promise<EmergencyContactRecord[]> {
    const response = await this.request.get(this.url(employeeId), {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: EmergencyContactRecord[] }).data;
  }

  async update(employeeId: string, id: number, data: EmergencyContactData) {
    const response = await this.request.put(`${this.url(employeeId)}/${id}`, {
      data: this.payload(data),
    });
    expect(response.status()).toBe(200);
  }

  async delete(employeeId: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url(employeeId), {
      data: { ids },
    });
    expect(response.status()).toBe(200);
  }
}
