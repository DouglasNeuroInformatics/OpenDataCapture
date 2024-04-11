import { describe, expect, it } from 'vitest';

import { $Summary } from './summary.js';

describe('$Summary', () => {
  it('should parse a valid summary', async () => {
    await expect(
      $Summary.parseAsync({
        counts: {
          instruments: 0,
          records: 0,
          subjects: 0,
          users: 0
        }
      })
    ).resolves.toBeTypeOf('object');
  });
  it('should reject a summary with negative values', async () => {
    await expect(() =>
      $Summary.parseAsync({
        counts: {
          instruments: -1,
          records: 0,
          subjects: 0,
          users: 0
        }
      })
    ).rejects.toThrowError();
  });
  it('should reject a summary with a NaN value', async () => {
    await expect(() =>
      $Summary.parseAsync({
        counts: {
          instruments: 0,
          records: 0,
          subjects: NaN,
          users: 0
        }
      })
    ).rejects.toThrowError();
  });
});
