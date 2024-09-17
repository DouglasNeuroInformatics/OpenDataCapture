import { faker } from '@faker-js/faker';
import type { SexType } from '@faker-js/faker';
import type { ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';

export const admin = Object.freeze({
  firstName: 'David',
  lastName: 'Roper',
  password: 'DataCapture2024',
  username: 'ropdav'
});

export const createSubjectIdentificationData = (): ClinicalSubjectIdentificationData => ({
  dateOfBirth: faker.date.birthdate({
    max: 80,
    min: 18,
    mode: 'age'
  }),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  sex: faker.person.sex().toUpperCase() as Uppercase<SexType>
});
