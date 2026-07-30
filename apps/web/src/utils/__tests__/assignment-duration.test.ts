import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';
import { describe, expect, it } from 'vitest';

import { getDefaultAssignmentExpiry, parseDurationDays } from '../assignment-duration';

const MS_PER_DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 1);

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

describe('getDefaultAssignmentExpiry', () => {
  it('should apply the configured instance default when set', () => {
    expect(getDefaultAssignmentExpiry(45, NOW).getTime()).toBe(NOW + 45 * MS_PER_DAY);
  });

  it('should fall back to the built-in default when null', () => {
    expect(getDefaultAssignmentExpiry(null, NOW).getTime()).toBe(NOW + DEFAULT_ASSIGNMENT_DURATION_DAYS * MS_PER_DAY);
  });

  it('should fall back to the built-in default when undefined', () => {
    expect(getDefaultAssignmentExpiry(undefined, NOW).getTime()).toBe(
      NOW + DEFAULT_ASSIGNMENT_DURATION_DAYS * MS_PER_DAY
    );
  });
});
