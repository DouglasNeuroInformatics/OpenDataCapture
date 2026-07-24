import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import { describe, expect, it } from 'vitest';

import { getDefaultAssignmentExpiry } from '../remote-assignment';

const MS_PER_DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 1);

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
