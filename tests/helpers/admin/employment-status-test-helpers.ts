import { faker } from '@faker-js/faker';
import type { EmploymentStatusData } from '../../../src/pages/api/employment-status-api';

export function createEmploymentStatus(
  suffix = faker.string.alphanumeric(8),
): EmploymentStatusData {
  return {
    name: `QA Employment Status ${suffix}`,
  };
}
