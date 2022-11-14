import HappinessQuestionnaire from '../models/instruments/HappinessQuestionnaire';
import Patient from '../models/Patient';

import createPatientId from './createPatientId';
import { getRandomDate, getRandomInteger, getRandomBirthday } from './random';

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

export async function purgeDatabase(): Promise<void> {
  await Patient.deleteMany({});
  await HappinessQuestionnaire.deleteMany({});
}

export async function createDummyPatients(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      for (const sex of ['male', 'female']) {
        const firstName = sex === 'male' ? maleNames[j] : femaleNames[j];
        const lastName = lastNames[i];
        const dateOfBirth = getRandomBirthday();
        const patientId = createPatientId(firstName, lastName, dateOfBirth);
        const patient = new Patient({
          _id: patientId,
          firstName: firstName,
          lastName: lastName,
          sex: sex,
          dateOfBirth: dateOfBirth,
        });
        await patient.save();
        for (let n = 0; n < 5; n++) {
          const questionnaire = new HappinessQuestionnaire({
            patientId: patientId,
            score: getRandomInteger(n, n + 3),
            createdAt: getRandomDate(new Date(2022, 0 + n), new Date(2022, 6)),
          });
          await questionnaire.save();
        }
      }
    }
  }
}
