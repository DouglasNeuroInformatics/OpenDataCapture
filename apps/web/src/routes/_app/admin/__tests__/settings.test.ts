import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';
import { describe, expect, it } from 'vitest';

import { parseDurationDays } from '../settings';

describe('parseDurationDays', () => {
  it.each(['1', '45', String(MAX_ASSIGNMENT_DURATION_DAYS)])('should accept the whole-day count %s', (raw) => {
    expect(parseDurationDays(raw)).toBe(Number(raw));
  });

  it.each(['', '   ', 'abc', '0', '-1', '1.5', String(MAX_ASSIGNMENT_DURATION_DAYS + 1)])(
    'should reject the invalid input %j',
    (raw) => {
      expect(parseDurationDays(raw)).toBeNull();
    }
  );
});
