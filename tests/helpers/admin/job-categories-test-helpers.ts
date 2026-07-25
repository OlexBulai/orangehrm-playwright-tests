import { faker } from '@faker-js/faker';
import type { JobCategoryData } from '../../../src/pages/api/job-categories-api';

export function createJobCategory(
  suffix = faker.string.alphanumeric(8),
): JobCategoryData {
  return { name: `QA Job Category ${suffix}` };
}
