import { test as base, expect } from './base.fixture';
import QualificationsApi from '../../../src/pages/api/qualifications-api';

type LanguageId = { languageId: number; fluencyId: number };
type Cleanup = {
  trackWork(id: number): void;
  forgetWork(id: number): void;
  trackLanguage(id: LanguageId): void;
  forgetLanguage(id: LanguageId): void;
};

type QualificationsFixtures = {
  qualificationsApi: QualificationsApi;
  qualificationsCleanup: Cleanup;
};

export const test = base.extend<QualificationsFixtures>({
  qualificationsApi: async ({ page }, use) => {
    await use(new QualificationsApi(page.request));
  },

  qualificationsCleanup: async ({ qualificationsApi, employeeId }, use) => {
    const workIds = new Set<number>();
    const languageIds = new Map<string, LanguageId>();
    const key = (id: LanguageId) => `${id.languageId}:${id.fluencyId}`;
    const cleanup: Cleanup = {
      trackWork: (id) => workIds.add(id),
      forgetWork: (id) => workIds.delete(id),
      trackLanguage: (id) => languageIds.set(key(id), id),
      forgetLanguage: (id) => languageIds.delete(key(id)),
    };

    try {
      await use(cleanup);
    } finally {
      await qualificationsApi.deleteWorkExperiences(employeeId, [...workIds]);
      await qualificationsApi.deleteLanguages(employeeId, [
        ...languageIds.values(),
      ]);
    }
  },
});

export { expect };
