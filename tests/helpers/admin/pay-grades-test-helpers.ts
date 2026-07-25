import { faker } from '@faker-js/faker';
import type { PayGradeData } from '../../../src/pages/api/pay-grades-api';

export function createPayGrade(
  suffix = faker.string.alphanumeric(8),
): PayGradeData {
  return {
    name: `QA Pay Grade ${suffix}`,
  };
}
