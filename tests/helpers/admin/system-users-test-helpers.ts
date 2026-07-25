import { faker } from '@faker-js/faker';

export type AdminEmployeeData = {
  firstName: string;
  lastName: string;
  employeeId: string;
};

export function createAdminEmployee(): AdminEmployeeData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    employeeId: `ADM${faker.string.numeric(7)}`,
  };
}

export function createSystemUsername(): string {
  return `auto_${faker.string.alphanumeric(12).toLowerCase()}`;
}

export const systemUserPassword = 'CodexTest123!';
