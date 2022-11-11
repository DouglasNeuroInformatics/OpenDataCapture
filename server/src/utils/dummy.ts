import Patient from '../models/Patient';

import createPatientId from './createPatientId';
import { getRandomBirthday } from './random';

const maleNames = [
  'James',
  'Robert',
  'John',
  'Michael',
  'David',
  'William',
  'Richard',
  'Joseph',
  'Thomas',
  'Charles',
];

const femaleNames = [
  'Mary',
  'Patricia',
  'Jennifer',
  'Linda',
  'Elizabeth',
  'Barbara',
  'Susan',
  'Jessica',
  'Sarah',
  'Karen',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
];

export async function createDummyPatients(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      for (const sex of ['male', 'female']) {
        const firstName = sex === 'male' ? maleNames[j] : femaleNames[j];
        const lastName = lastNames[i];
        const dateOfBirth = getRandomBirthday();
        const patient = new Patient({
          _id: createPatientId(firstName, lastName, dateOfBirth),
          firstName: firstName,
          lastName: lastName,
          sex: sex,
          dateOfBirth: dateOfBirth,
        });
        await patient.save();
      }
    }
  }
}
