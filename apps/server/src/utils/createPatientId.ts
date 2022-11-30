import { createHash } from 'crypto';

import { StringUtils } from 'utils';

export default function createPatientId(firstName: string, lastName: string, dateOfBirth: Date): string {
  const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
  const source = StringUtils.sanitize(firstName + lastName) + StringUtils.sanitize(shortDateOfBirth, true);
  return createHash('sha256').update(source).digest('hex');
}
