import { faker } from '@faker-js/faker';
import { ImmigrationDocumentData } from '../../../src/pages/components/immigration-component';

function createDocument(
  documentType: 'Passport' | 'Visa',
): ImmigrationDocumentData {
  return {
    documentType,
    number: faker.string.alphanumeric(10).toUpperCase(),
    issuedDate: '2020-15-06',
    expiryDate: '2030-15-06',
    eligibleStatus: 'Eligible',
    issuedBy: { name: 'Ukraine', code: 'UA' },
    eligibleReviewDate: '2029-15-06',
    comments: `${documentType} created by automated test`,
  };
}

export function createPassport(): ImmigrationDocumentData {
  return createDocument('Passport');
}

export function createVisa(): ImmigrationDocumentData {
  return createDocument('Visa');
}
