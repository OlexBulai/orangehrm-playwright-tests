import { faker } from '@faker-js/faker';
import type { JobTitleData } from '../../../src/pages/api/job-titles-api';

export function createJobTitle(
  suffix = faker.string.alphanumeric(8),
): JobTitleData {
  return {
    title: `Automation Engineer ${suffix}`,
    description: faker.lorem.sentence(),
    note: 'Created by Playwright automation',
  };
}
