import { describe, expect, it } from 'vitest';

import {
  encodeScopedSubjectId,
  generateSubjectHash,
  isSubjectWithPersonalInfo,
  removeSubjectIdScope
} from '../index.js';

const validIdentificationData = {
  dateOfBirth: new Date('1990-01-01'),
  firstName: 'Jane',
  lastName: 'Doe',
  sex: 'FEMALE'
} as const;

describe('generateSubjectHash', () => {
  it('should hash valid clinical identification data to a deterministic string', async () => {
    await expect(generateSubjectHash(validIdentificationData)).resolves.toEqual(
      await generateSubjectHash(validIdentificationData)
    );
  });
  it('should hash accented names the same as their unaccented transliteration', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, firstName: 'Jané' })).resolves.toEqual(
      await generateSubjectHash({ ...validIdentificationData, firstName: 'Jane' })
    );
  });
  it('should reject a missing dateOfBirth', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, dateOfBirth: 'not-a-date' as any })).rejects.toThrow(
      /dateOfBirth/
    );
  });
  it('should reject a missing firstName', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, firstName: undefined as any })).rejects.toThrow(
      /firstName/
    );
  });
  it('should reject a missing lastName', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, lastName: undefined as any })).rejects.toThrow(
      /lastName/
    );
  });
  it('should reject a sex that is neither MALE nor FEMALE', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, sex: 'OTHER' as any })).rejects.toThrow(/sex/);
  });
});

describe('isSubjectWithPersonalInfo', () => {
  it('should return true when every personal info field is present', () => {
    expect(
      isSubjectWithPersonalInfo({
        dateOfBirth: new Date('1990-01-01'),
        firstName: 'Jane',
        id: 'subject-1',
        lastName: 'Doe',
        sex: 'FEMALE'
      })
    ).toBe(true);
  });
  it('should return false when a personal info field is null', () => {
    expect(
      isSubjectWithPersonalInfo({
        dateOfBirth: null,
        firstName: 'Jane',
        id: 'subject-1',
        lastName: 'Doe',
        sex: 'FEMALE'
      })
    ).toBe(false);
  });
  it('should return false when a personal info field is undefined', () => {
    expect(
      isSubjectWithPersonalInfo({
        dateOfBirth: new Date('1990-01-01'),
        firstName: undefined,
        id: 'subject-1',
        lastName: 'Doe',
        sex: 'FEMALE'
      })
    ).toBe(false);
  });
});

describe('encodeScopedSubjectId', () => {
  it('should join the group name and subject ID with a $, replacing spaces with underscores', () => {
    expect(encodeScopedSubjectId(123, { groupName: 'My Group' })).toBe('My_Group$123');
  });
});

describe('removeSubjectIdScope', () => {
  it('should re-export the runtime-internal implementation', () => {
    expect(removeSubjectIdScope('My_Group$123')).toBe('123');
  });
});
