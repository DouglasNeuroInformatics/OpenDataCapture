import { createHash } from 'crypto';

import { sanitize } from './string';

export default function createPatientId(
  firstName: string,
  lastName: string,
  dateOfBirth: Date
): string {
  const source =
    sanitize(firstName + lastName) + sanitize(dateOfBirth.toISOString().split('T')[0], true);
  return createHash('sha256').update(source).digest('hex');
}
