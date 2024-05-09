import { sha256 } from '@opendatacapture/crypto';
import { $ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import type { ClinicalSubjectIdentificationData, Subject } from '@opendatacapture/schemas/subject';
import type { SetNonNullable } from 'type-fest';
import unidecode from 'unidecode';

type SubjectPersonalInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

export async function generateSubjectHash(data: ClinicalSubjectIdentificationData): Promise<string> {
  // In case the type system breaks somewhere, this should crash at runtime instead of generating an incorrect ID which would cause chaos
  const { dateOfBirth, firstName, lastName, sex } = await $ClinicalSubjectIdentificationData.parseAsync(data);
  const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
  const info = firstName + lastName + shortDateOfBirth + sex;
  const source = unidecode(info.toUpperCase().replaceAll('-', ''));
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
