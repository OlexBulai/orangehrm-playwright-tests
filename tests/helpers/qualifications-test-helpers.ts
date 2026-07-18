import { WorkExperienceData } from '../../src/pages/components/qualifications-component';

export function createWorkExperience(
  suffix = Date.now().toString().slice(-7),
): WorkExperienceData {
  return {
    company: `Codex Company ${suffix}`,
    jobTitle: 'QA Engineer',
    fromDate: '2020-01-01',
    toDate: '2022-31-12',
    comment: 'Created by Playwright',
  };
}

export const testLanguage = {
  language: 'French',
  languageId: 4,
  fluency: 'Reading',
  fluencyId: 3,
  competency: 'Good',
  competencyId: 3,
  comment: 'Created by Playwright',
};
