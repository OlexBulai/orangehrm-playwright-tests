import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type SystemUserData = {
  username: string;
  password: string;
  role: 'Admin' | 'ESS';
  roleId: 1 | 2;
  status: 'Enabled' | 'Disabled';
  employeeNumber: number;
};

export type SystemUserRecord = {
  id: number;
  userName: string;
  status: boolean;
  employee: { empNumber: number; firstName: string; lastName: string };
  userRole: { id: number; displayName: string };
};

export default class AdminApi {
  constructor(private readonly request: APIRequestContext) {}

  async createEmployee(
    firstName: string,
    lastName: string,
    employeeId: string,
  ) {
    const response = await this.request.post(
      `${baseUrl}/api/v2/pim/employees`,
      {
        data: { firstName, middleName: '', lastName, employeeId },
      },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: { empNumber: number } }).data
      .empNumber;
  }

  async createSystemUser(data: SystemUserData) {
    const response = await this.request.post(`${baseUrl}/api/v2/admin/users`, {
      data: {
        username: data.username,
        password: data.password,
        status: data.status === 'Enabled',
        userRoleId: data.roleId,
        empNumber: data.employeeNumber,
      },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: SystemUserRecord }).data.id;
  }

  async updateSystemUser(id: number, data: SystemUserData) {
    const response = await this.request.put(
      `${baseUrl}/api/v2/admin/users/${id}`,
      {
        data: {
          username: data.username,
          password: '',
          status: data.status === 'Enabled',
          userRoleId: data.roleId,
          empNumber: data.employeeNumber,
          changePassword: false,
        },
      },
    );
    expect(response.status()).toBe(200);
  }

  async getSystemUsers() {
    const response = await this.request.get(`${baseUrl}/api/v2/admin/users`, {
      params: {
        limit: 50,
        offset: 0,
        sortField: 'u.userName',
        sortOrder: 'ASC',
      },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: SystemUserRecord[] }).data;
  }

  async deleteSystemUsers(ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/admin/users`,
      {
        data: { ids },
      },
    );
    expect([200, 404]).toContain(response.status());
  }

  async deleteEmployees(ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/pim/employees`,
      {
        data: { ids },
      },
    );
    expect(response.status()).toBe(200);
  }
}
