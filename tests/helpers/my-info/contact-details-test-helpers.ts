import { faker } from '@faker-js/faker';
import { ContactDetailsData } from '../../../src/pages/components/contact-details-component';

export function createContactDetails(): ContactDetailsData {
  return {
    street1: faker.location.streetAddress(),
    street2: `Suite ${faker.number.int({ min: 1, max: 999 })}`,
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: 'Ukraine',
    homePhone: faker.string.numeric(10),
    mobile: faker.string.numeric(10),
    workPhone: faker.string.numeric(10),
    workEmail: faker.internet.email().toLowerCase(),
    otherEmail: faker.internet.email().toLowerCase(),
  };
}

export function createInvalidEmail(): string {
  return faker.internet.email().replace('@', '');
}
