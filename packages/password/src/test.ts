import { describe, expect, it } from 'vitest';

import { estimatePasswordStrength } from './index.js';

describe('estimatePasswordStrength', () => {
  it('should reject a commonly used password', () => {
    expect(estimatePasswordStrength('password')).toMatchObject({ success: false });
  });
});
