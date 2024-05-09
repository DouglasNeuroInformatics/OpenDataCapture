import { sha256 } from '@opendatacapture/crypto';
import { $ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import type { ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import unidecode from 'unidecode';

export async function generateSubjectHash(data: ClinicalSubjectIdentificationData): Promise<string> {
  // In case the type system breaks somewhere, this should crash at runtime instead of generating an incorrect ID which would cause chaos
  const { dateOfBirth, firstName, lastName, sex } = await $ClinicalSubjectIdentificationData.parseAsync(data);
  const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
  const info = firstName + lastName + shortDateOfBirth + sex;
  const source = unidecode(info.toUpperCase().replaceAll('-', ''));
  return sha256(source);
}
