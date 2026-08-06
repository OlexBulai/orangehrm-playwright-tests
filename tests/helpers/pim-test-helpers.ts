import { faker } from '@faker-js/faker';
import type { PimEmployeeData } from '../../src/pages/api/pim-api';

export function createPimEmployee(suffix: string): PimEmployeeData {
  return {
    firstName: faker.person.firstName(),
    middleName: '',
    lastName: faker.person.lastName(),
    employeeId: `P${suffix[0].toUpperCase()}${faker.string.numeric(7)}`,
  };
}
