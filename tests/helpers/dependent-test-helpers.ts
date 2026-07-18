import { faker } from '@faker-js/faker';
import { DependentData } from '../../src/pages/components/dependents-component';

export function createChildDependent(): DependentData {
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    relationshipType: 'Child',
    dateOfBirth: '2015-20-06',
  };
}

export function createOtherDependent(): DependentData {
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    relationshipType: 'Other',
    relationship: 'Guardian',
    dateOfBirth: '1990-15-04',
  };
}
