import { sha256 } from '@douglasneuroinformatics/libcrypto';
import type { ClinicalSubjectIdentificationData, Subject } from '@opendatacapture/schemas/subject';
import { transliterate } from 'transliteration';
import type { SetNonNullable } from 'type-fest';

type SubjectPersonalInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

function parseClinicalSubjectIdentificationData({
  dateOfBirth,
  firstName,
  lastName,
  sex
}: {
  [key: string]: unknown;
}): ClinicalSubjectIdentificationData {
  if (!(dateOfBirth instanceof Date)) {
    throw new Error('Invalid or missing dateOfBirth: Expected a Date object.');
  } else if (typeof firstName !== 'string') {
    throw new Error('Invalid or missing firstName: Expected a string.');
  } else if (typeof lastName !== 'string') {
    throw new Error('Invalid or missing lastName: Expected a string.');
  } else if (!(sex === 'MALE' || sex === 'FEMALE')) {
    throw new Error('Invalid or missing sex: Expected "MALE" or "FEMALE".');
  }
  return {
    dateOfBirth,
    firstName,
    lastName,
    sex
  };
}

export async function generateSubjectHash(data: ClinicalSubjectIdentificationData): Promise<string> {
  // In case the type system breaks somewhere, this should crash at runtime instead of generating an incorrect ID which would cause chaos
  const { dateOfBirth, firstName, lastName, sex } = parseClinicalSubjectIdentificationData(data);
  const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
  const info = firstName + lastName + shortDateOfBirth + sex;
  const source = transliterate(info.toUpperCase().replaceAll('-', ''));
  return sha256(source);
}

export function isSubjectWithPersonalInfo<T extends SubjectPersonalInfo>(
  subject: T
): subject is Required<SetNonNullable<SubjectPersonalInfo>> & T {
  const requiredProperties = ['dateOfBirth', 'firstName', 'id', 'lastName', 'sex'] as const;
  for (const property of requiredProperties) {
    if (subject[property] === undefined || subject[property] === null) {
      return false;
    }
  }
  return true;
}

export function encodeScopedSubjectId(id: number | string, options: { groupName: string }) {
  return options.groupName.replaceAll(' ', '_') + '$' + id;
}

export { removeSubjectIdScope } from '@opendatacapture/runtime-internal';
