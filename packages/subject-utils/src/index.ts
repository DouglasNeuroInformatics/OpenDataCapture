import { sha256 } from '@douglasneuroinformatics/libcrypto';
import type {
  ClinicalSubjectIdentificationData,
  Subject,
  SubjectIdentificationMethod
} from '@opendatacapture/schemas/subject';
import { transliterate } from 'transliteration';
import type { SetNonNullable } from 'type-fest';

type SubjectPersonalInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

// libcrypto's sha256 writes each byte as two lowercase hex digits, so no stored name hash has an uppercase letter.
const PERSONAL_INFO_SUBJECT_ID_PATTERN = /^[0-9a-f]{64}$/;

const CUSTOM_FIELDS_SUBJECT_ID_PREFIX = 'cf_';

const CUSTOM_FIELDS_SUBJECT_ID_PATTERN = new RegExp(`^${CUSTOM_FIELDS_SUBJECT_ID_PREFIX}[0-9a-f]{64}$`);

const CUSTOM_FIELDS_SALT_PATTERN = /^[0-9a-f]{64}$/;

const UNDECOMPOSABLE_LETTER_SPELLINGS = [
  ['Œ', 'OE'],
  ['Æ', 'AE'],
  ['Ø', 'O'],
  ['Ł', 'L'],
  ['Đ', 'D'],
  ['Ð', 'D'],
  ['Þ', 'TH']
] as const;

function decodeCustomFieldsSalt(salt: string) {
  if (!CUSTOM_FIELDS_SALT_PATTERN.test(salt)) {
    throw new Error('Invalid custom fields salt: Expected 64 lowercase hexadecimal characters.');
  }
  return Uint8Array.from({ length: salt.length / 2 }, (_, index) => {
    return Number.parseInt(salt.slice(index * 2, index * 2 + 2), 16);
  });
}

function encodeLowercaseHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

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

export function encodeScopedSubjectId(id: string, options: { groupName: string }) {
  return `${options.groupName.replaceAll(' ', '_')}$${id}`;
}

export function inferSubjectIdentificationMethod(subjectId: string): SubjectIdentificationMethod {
  return PERSONAL_INFO_SUBJECT_ID_PATTERN.test(subjectId) ? 'PERSONAL_INFO' : 'CUSTOM_ID';
}

export function isCustomFieldsSubjectId(subjectId: string): boolean {
  return CUSTOM_FIELDS_SUBJECT_ID_PATTERN.test(subjectId);
}

export function toStoredSubjectId(enteredId: string, options: { groupName: string }): string {
  // Only a custom id belongs to a group; a name hash or a custom-fields id names the same subject in every group.
  if (
    enteredId.includes('$') ||
    isCustomFieldsSubjectId(enteredId) ||
    inferSubjectIdentificationMethod(enteredId) !== 'CUSTOM_ID'
  ) {
    return enteredId;
  }
  return encodeScopedSubjectId(enteredId, options);
}

// Every step, in this order, and the letter table are part of each stored cf_ id: the typed values
// are never stored, so no id can be recomputed after a change. Uppercasing goes first because it
// can add a combining mark (ǰ becomes J and a caron) that the last step removes. transliteration is
// not used because it spells 李 and 里 alike, which would merge two subjects.
export function normalizeCustomFieldValue(value: string): string {
  let normalized = value.toUpperCase().normalize('NFKD');
  for (const [letter, spelling] of UNDECOMPOSABLE_LETTER_SPELLINGS) {
    normalized = normalized.replaceAll(letter, spelling);
  }
  return normalized.replaceAll(/[^\p{L}\p{N}]/gu, '');
}

export async function deriveCustomFieldsSubjectId(
  typedValues: readonly string[],
  options: { iterations: number; salt: string }
): Promise<string> {
  if (typedValues.length === 0) {
    throw new Error('Invalid custom field values: Expected at least one value.');
  }
  const normalizedValues = typedValues.map((value) => normalizeCustomFieldValue(value));
  if (normalizedValues.includes('')) {
    throw new Error('Invalid custom field value: Expected at least one letter or digit.');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JSON.stringify(normalizedValues)),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { hash: 'SHA-256', iterations: options.iterations, name: 'PBKDF2', salt: decodeCustomFieldsSalt(options.salt) },
    key,
    256
  );
  return CUSTOM_FIELDS_SUBJECT_ID_PREFIX + encodeLowercaseHex(derivedBits);
}

export { CUSTOM_FIELDS_SUBJECT_ID_PREFIX };

export { removeSubjectIdScope } from '@opendatacapture/runtime-internal';
