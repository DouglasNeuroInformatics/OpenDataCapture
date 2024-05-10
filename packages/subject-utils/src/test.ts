import type { ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { describe, expect, it } from 'vitest';

import { generateSubjectHash } from './index.js';

const inputData: ClinicalSubjectIdentificationData = Object.freeze({
  dateOfBirth: new Date(2000),
  firstName: 'Jane',
  lastName: 'Doe',
  sex: 'FEMALE'
});

describe('generateSubjectHash', () => {
  it('should generate the same hash for the same data', async () => {
    const h1 = await generateSubjectHash(inputData);
    const h2 = await generateSubjectHash(inputData);
    expect(h1).toBe(h2);
  });
  it('should generate the same hash for the data where the only different is an accented latin character', async () => {
    const h1 = await generateSubjectHash(inputData);
    const h2 = await generateSubjectHash({ ...inputData, lastName: 'Doé' });
    expect(h1).toBe(h2);
  });
  it('should generate different hashes for different data', async () => {
    const h1 = await generateSubjectHash(inputData);
    const h2 = await generateSubjectHash({ ...inputData, lastName: 'Smith' });
    expect(h1).not.toBe(h2);
  });
});
