import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';

export type VacancyData = {
  name: string;
  jobTitleId: number;
  employeeId: number;
};

export type CandidateData = {
  firstName: string;
  lastName: string;
  email: string;
  vacancyId: number;
};

export default class RecruitmentApi {
  constructor(private readonly request: APIRequestContext) {}

  async createVacancy(data: VacancyData): Promise<number> {
    const response = await this.request.post(
      `${baseUrl}/api/v2/recruitment/vacancies`,
      {
        data: {
          ...data,
          description: 'Vacancy for the recruitment shortlist test',
          numOfPositions: 1,
          status: true,
          isPublished: false,
        },
      },
    );
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async createCandidate(data: CandidateData): Promise<number> {
    const response = await this.request.post(
      `${baseUrl}/api/v2/recruitment/candidates`,
      {
        data: {
          ...data,
          middleName: '',
          contactNumber: null,
          keywords: null,
          comment: null,
          dateOfApplication: new Date().toISOString().slice(0, 10),
          consentToKeepData: false,
        },
      },
    );
    expect(response.status(), await response.text()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async deleteCandidates(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/recruitment/candidates`,
      { data: { ids } },
    );
    expect([200, 404]).toContain(response.status());
  }

  async deleteVacancies(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const response = await this.request.delete(
      `${baseUrl}/api/v2/recruitment/vacancies`,
      { data: { ids } },
    );
    expect([200, 404]).toContain(response.status());
  }
}
