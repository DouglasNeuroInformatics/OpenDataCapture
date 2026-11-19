import type { ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { describe, expect, it } from 'vitest';

import {
  encodeScopedSubjectId,
  generateSubjectHash,
  inferSubjectIdentificationMethod,
  isSubjectWithPersonalInfo,
  removeSubjectIdScope,
  toStoredSubjectId
} from '../index.js';

const validIdentificationData = {
  dateOfBirth: new Date('1990-01-01'),
  firstName: 'Jane',
  lastName: 'Doe',
  sex: 'FEMALE'
} as const;

const nameHash = '520be817915752b50f418a743a54b692ce8e2a0a3421931598ffad246182568f';

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
  it('should hash different identification data to different strings', async () => {
    await expect(generateSubjectHash({ ...validIdentificationData, lastName: 'Smith' })).resolves.not.toEqual(
      await generateSubjectHash(validIdentificationData)
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

  describe('known outputs, which are the stored ids of existing subjects', () => {
    const digestOf = (data: Partial<ClinicalSubjectIdentificationData>) => {
      return generateSubjectHash({ ...validIdentificationData, ...data });
    };

    it('should hash Jane Doe, born 1990-01-01, female, as JANEDOE19900101FEMALE', async () => {
      await expect(digestOf({})).resolves.toBe('520be817915752b50f418a743a54b692ce8e2a0a3421931598ffad246182568f');
    });
    it('should hash the sex, so a male Jane Doe is another subject', async () => {
      await expect(digestOf({ sex: 'MALE' })).resolves.toBe(
        'a4c3acc853e01af7d008cef43cd706e7172546adab038253227cb508f914dff2'
      );
    });
    it('should hash the UTC date of birth, so 23:00 at UTC-5 counts as the next day', async () => {
      await expect(digestOf({ dateOfBirth: new Date('1990-01-01T23:00:00.000-05:00') })).resolves.toBe(
        '69a9b6a4c7f6ea5aa909bf49de9b3255f545ee73198f35c73591b92597e5a9e2'
      );
    });
    it('should ignore accents, so Jané is the same subject as Jane', async () => {
      await expect(digestOf({ firstName: 'Jané' })).resolves.toBe(
        '520be817915752b50f418a743a54b692ce8e2a0a3421931598ffad246182568f'
      );
    });
    it('should spell out a ligature, so Lebœuf hashes as LEBOEUF', async () => {
      await expect(digestOf({ lastName: 'Lebœuf' })).resolves.toBe(
        'b6b01685562db0f6a70e2f733d5bb69a324606a3a2b453bdd2cd188366ab3ff7'
      );
    });
    it('should hash Leboeuf as LEBOEUF, so it is the same subject as Lebœuf', async () => {
      await expect(digestOf({ lastName: 'Leboeuf' })).resolves.toBe(
        'b6b01685562db0f6a70e2f733d5bb69a324606a3a2b453bdd2cd188366ab3ff7'
      );
    });
    it('should remove a plain hyphen, so Jean-Paul hashes as JEANPAUL', async () => {
      await expect(digestOf({ firstName: 'Jean-Paul' })).resolves.toBe(
        '8665e6f202aacdd33ed13e7ee8b009c0a8ca251b38538cb4b67726bd32e74a22'
      );
    });
    it('should keep a space, so Jean Paul hashes as JEAN PAUL', async () => {
      await expect(digestOf({ firstName: 'Jean Paul' })).resolves.toBe(
        '121a8f52d912a1a528a2e9ab64161565b30e49b2a8e2d4854f8eb7724fd6c2fa'
      );
    });
    it('should keep a non-breaking hyphen as a plain one, so Jean\u2011Paul hashes as JEAN-PAUL', async () => {
      await expect(digestOf({ firstName: 'Jean\u2011Paul' })).resolves.toBe(
        '3e5e80408aff02aabe1801569cb21e2aadb8d28db7914f392df0ce16fc698dba'
      );
    });
    it('should keep a trailing space, so Jean-Paul followed by a space hashes as JEANPAUL with the space', async () => {
      await expect(digestOf({ firstName: 'Jean-Paul ' })).resolves.toBe(
        'f0d8a30dafa14c148c715b6254ba6a9756d3a475e4d18491be6f2e6a2cdfd99f'
      );
    });
    it("should keep an apostrophe, so O'Brien hashes as O'BRIEN", async () => {
      await expect(digestOf({ lastName: "O'Brien" })).resolves.toBe(
        '93cf2857f689f1868ddd4792bcb19fab10ff46027fa453f27c249578f8739e0e'
      );
    });
    it('should romanize 李 as Li followed by a space', async () => {
      await expect(digestOf({ firstName: '李' })).resolves.toBe(
        '0062948bce4a918ea435a2412dd14aa3e5a7b64980a390155946d6f7104752f3'
      );
    });
    it('should romanize 里 as Li too, so it is the same subject as 李', async () => {
      await expect(digestOf({ firstName: '里' })).resolves.toBe(
        '0062948bce4a918ea435a2412dd14aa3e5a7b64980a390155946d6f7104752f3'
      );
    });
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
    expect(encodeScopedSubjectId('123', { groupName: 'My Group' })).toBe('My_Group$123');
  });
});

describe('removeSubjectIdScope', () => {
  it('should re-export the runtime-internal implementation', () => {
    expect(removeSubjectIdScope('My_Group$123')).toBe('123');
  });
});

describe('inferSubjectIdentificationMethod', () => {
  it('should read a bare 64-character lowercase hex digest as a name hash', () => {
    expect(inferSubjectIdentificationMethod(nameHash)).toBe('PERSONAL_INFO');
  });
  it('should read an uppercase digest as a custom id, since a name hash is always lowercase', () => {
    expect(inferSubjectIdentificationMethod(nameHash.toUpperCase())).toBe('CUSTOM_ID');
  });
  it('should read a truncated digest as a custom id', () => {
    expect(inferSubjectIdentificationMethod(nameHash.slice(0, 63))).toBe('CUSTOM_ID');
  });
  it('should read a scoped digest as a custom id, since a name hash is never scoped', () => {
    expect(inferSubjectIdentificationMethod(`My_Group$${nameHash}`)).toBe('CUSTOM_ID');
  });
  it('should read any other value as a custom id', () => {
    expect(inferSubjectIdentificationMethod('ex_111')).toBe('CUSTOM_ID');
  });
});

describe('toStoredSubjectId', () => {
  it('should scope a custom id to the group, as Start Session stores it', () => {
    expect(toStoredSubjectId('ex_111', { groupName: 'My Group' })).toBe('My_Group$ex_111');
  });
  it('should leave a name hash unscoped, so it names the subject every group shares', () => {
    expect(toStoredSubjectId(nameHash, { groupName: 'My Group' })).toBe(nameHash);
  });
  it('should scope an uppercase digest, which cannot be a name hash', () => {
    expect(toStoredSubjectId(nameHash.toUpperCase(), { groupName: 'My Group' })).toBe(
      `My_Group$${nameHash.toUpperCase()}`
    );
  });
  it('should leave a value that already holds a scope alone', () => {
    expect(toStoredSubjectId('Other_Group$ex_111', { groupName: 'My Group' })).toBe('Other_Group$ex_111');
  });
});
