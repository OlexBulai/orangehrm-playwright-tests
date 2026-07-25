import { faker } from '@faker-js/faker';
import type { WorkShiftData } from '../../../src/pages/api/work-shifts-api';

export function createWorkShift(
  suffix = faker.string.alphanumeric(8),
): WorkShiftData {
  return {
    name: `QA Work Shift ${suffix}`,
    startTime: '08:00',
    endTime: '16:00',
    hoursPerDay: '8.00',
    empNumbers: [],
  };
}
