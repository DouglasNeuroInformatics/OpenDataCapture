import { Random } from 'utils';

import HappinessQuestionnaire from '../models/instruments/HappinessQuestionnaire';
import Subject from '../models/Subject';

import createSubjectId from './createSubjectId';

const maleNames = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles'];

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
  'Karen'
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
  'Martinez'
];

export async function purgeDatabase(): Promise<void> {
  await Subject.deleteMany({});
  await HappinessQuestionnaire.deleteMany({});
}

export async function createDummySubjects(): Promise<void> {
  // score is computed to generate fake trend where females increase over time
  const computeScore = (timepoint: number, sex: 'male' | 'female'): number => {
    if (sex === 'female') {
      return Math.min(Random.int(1 + timepoint * 2, 11), 10);
    }
    return Random.int(1, 11);
  };

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      for (const sex of ['male', 'female'] as const) {
        const firstName = sex === 'male' ? maleNames[j] : femaleNames[j];
        const lastName = lastNames[i];
        const dateOfBirth = Random.birthday();
        const subjectId = createSubjectId(firstName, lastName, dateOfBirth);
        const subject = new Subject({
          _id: subjectId,
          firstName: firstName,
          lastName: lastName,
          sex: sex,
          dateOfBirth: dateOfBirth
        });
        await subject.save();
        for (let n = 0; n < 4; n++) {
          const questionnaire = new HappinessQuestionnaire({
            subjectId: subjectId,
            score: computeScore(n, sex),
            createdAt: Random.date(new Date(2022, 0 + n), new Date(2022, 6))
          });
          await questionnaire.save();
        }
      }
    }
  }
}
