import { faker } from '@faker-js/faker';
import { EmergencyContactData } from '../../../src/pages/components/emergency-contacts-component';

export function createEmergencyContact(): EmergencyContactData {
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    relationship: 'Friend',
    homePhone: faker.string.numeric(10),
    mobilePhone: faker.string.numeric(10),
    workPhone: faker.string.numeric(10),
  };
}
