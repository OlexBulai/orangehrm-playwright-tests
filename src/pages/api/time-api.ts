import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export default class TimeApi {
  constructor(private readonly request: APIRequestContext) {}

  async createCustomer(name: string): Promise<number> {
    const response = await this.request.post(`${baseUrl}/api/v2/time/customers`, {
      data: { name, description: 'Customer for the timesheet test' },
    });
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async createProject(
    name: string,
    customerId: number,
    adminEmployeeNumber: number,
  ): Promise<number> {
    const response = await this.request.post(`${baseUrl}/api/v2/time/projects`, {
      data: {
        customerId,
        name,
        description: 'Project for the timesheet test',
        projectAdminsEmpNumbers: [adminEmployeeNumber],
      },
    });
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async createActivity(projectId: number, name: string): Promise<number> {
    const response = await this.request.post(
      `${baseUrl}/api/v2/time/project/${projectId}/activities`,
      { data: { name } },
    );
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async createTimesheet(employeeNumber: number): Promise<number> {
    const response = await this.request.post(
      `${baseUrl}/api/v2/time/employees/${employeeNumber}/timesheets`,
      {
        data: { date: new Date().toISOString().slice(0, 10) },
      },
    );
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async clearTimesheet(
    employeeNumber: number,
    timesheetId: number,
  ): Promise<void> {
    const entriesUrl = `${baseUrl}/api/v2/time/employees/timesheets/${timesheetId}/entries`;
    const entriesResponse = await this.request.get(entriesUrl);
    expect(entriesResponse.status()).toBe(200);
    const body = (await entriesResponse.json()) as {
      data: Array<{ project: { id: number }; activity: { id: number } }>;
      meta: { allowedActions: Array<{ action: string }> };
    };

    if (body.meta.allowedActions.some(({ action }) => action === 'RESET')) {
      const resetResponse = await this.request.put(
        `${baseUrl}/api/v2/time/employees/${employeeNumber}/timesheets/${timesheetId}`,
        { data: { action: 'RESET' } },
      );
      expect(resetResponse.status(), await resetResponse.text()).toBe(200);
    }

    const deletedEntries = body.data.map(({ project, activity }) => ({
      projectId: project.id,
      activityId: activity.id,
    }));
    if (deletedEntries.length === 0) return;

    const clearResponse = await this.request.put(entriesUrl, {
      data: { entries: [], deletedEntries },
    });
    expect(clearResponse.status(), await clearResponse.text()).toBe(200);
  }

  async deleteProjects(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(`${baseUrl}/api/v2/time/projects`, {
      data: { ids },
    });
    expect([200, 404]).toContain(response.status());
  }

  async deleteCustomers(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/time/customers`,
      { data: { ids } },
    );
    expect([200, 404]).toContain(response.status());
  }
}
