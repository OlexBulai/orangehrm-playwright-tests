import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import { WorkExperienceData } from '../components/qualifications-component';

export type QualificationLists = {
  workExperiences: Array<{ id: number; company: string; jobTitle: string }>;
  educations: Array<{ education: { name: string } }>;
  skills: Array<{ skill: { name: string }; yearsOfExperience: string | number }>;
  languages: Array<{
    language: { name: string };
    fluency: { name: string };
    competency: { name: string };
  }>;
  licenses: Array<{ license: { name: string }; licenseNo: string }>;
};

type DataResponse<T> = { data: T };

function toApiDate(uiDate: string): string {
  const [year, day, month] = uiDate.split('-');
  return `${year}-${month}-${day}`;
}

export default class QualificationsApi {
  constructor(private readonly request: APIRequestContext) {}

  private employeeUrl(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}`;
  }

  async createWorkExperience(employeeId: string, data: WorkExperienceData) {
    const response = await this.request.post(
      `${this.employeeUrl(employeeId)}/work-experiences`,
      {
        data: {
          company: data.company,
          jobTitle: data.jobTitle,
          fromDate: toApiDate(data.fromDate),
          toDate: toApiDate(data.toDate),
          comment: data.comment,
        },
      },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as DataResponse<{ id: number }>).data.id;
  }

  async createLanguage(
    employeeId: string,
    data: {
      languageId: number;
      fluencyId: number;
      competencyId: number;
      comment: string;
    },
  ) {
    const response = await this.request.post(
      `${this.employeeUrl(employeeId)}/languages`,
      {
        data: {
          languageId: data.languageId,
          fluencyId: data.fluencyId,
          competencyId: data.competencyId,
          comment: data.comment,
        },
      },
    );
    expect(response.status()).toBe(200);
  }

  async deleteWorkExperiences(employeeId: string, ids: number[]) {
    await this.delete(`${this.employeeUrl(employeeId)}/work-experiences`, ids);
  }

  async deleteLanguages(
    employeeId: string,
    ids: Array<{ languageId: number; fluencyId: number }>,
  ) {
    await this.delete(`${this.employeeUrl(employeeId)}/languages`, ids);
  }

  async getLists(employeeId: string): Promise<QualificationLists> {
    const [workExperiences, educations, skills, languages, licenses] =
      await Promise.all([
        this.getList(employeeId, 'work-experiences'),
        this.getList(employeeId, 'educations'),
        this.getList(employeeId, 'skills'),
        this.getList(employeeId, 'languages'),
        this.getList(employeeId, 'licenses'),
      ]);
    return { workExperiences, educations, skills, languages, licenses } as QualificationLists;
  }

  async getCustomFieldCount(employeeId: string) {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/custom-fields`,
      { params: { screen: 'qualifications' } },
    );
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { meta: { fields: unknown[] } };
    return body.meta.fields.length;
  }

  private async getList(employeeId: string, endpoint: string): Promise<unknown[]> {
    const response = await this.request.get(
      `${this.employeeUrl(employeeId)}/${endpoint}`,
      { params: { limit: 50, offset: 0 } },
    );
    expect(response.status()).toBe(200);
    return ((await response.json()) as DataResponse<unknown[]>).data;
  }

  private async delete(url: string, ids: unknown[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(url, { data: { ids } });
    expect(response.status()).toBe(200);
  }
}
