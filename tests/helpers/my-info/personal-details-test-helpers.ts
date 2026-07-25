import { faker } from '@faker-js/faker';
import {
  DrivingLicenseDetails,
  EmployeeIdentifiers,
  EmployeeName,
  PersonalSelections,
} from '../../../src/pages/components/personal-details-component';

export function createEmployeeName(): EmployeeName {
  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
}

export function createEmployeeIdentifiers(): EmployeeIdentifiers {
  return {
    employeeId: faker.string.alphanumeric(8),
    otherId: faker.string.numeric(8),
  };
}

export function createDrivingLicenseDetails(): DrivingLicenseDetails {
  return {
    number: faker.string.alphanumeric(10),
    expiryDate: '2028-15-06',
  };
}

export function createPersonalSelections(): PersonalSelections {
  return {
    maritalStatus: 'Married',
    gender: 'Female',
  };
}
