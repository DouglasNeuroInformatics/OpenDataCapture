import { describe, expect, it, vi } from 'vitest';

import { generateToken } from '../auth';

vi.mock('@/config', () => ({ config: { apiKey: 'k'.repeat(32) } }));

describe('generateToken', () => {
  it('should hash the api key followed by the assignment id as hex-encoded sha256', () => {
    expect(generateToken('assignment-1')).toBe('060ebadcc36919ccec5f1d9ce6acf496488c6a03fe68cb856d5f1f99ce6c725e');
  });

  it('should return the same token for the same assignment, so the api can recompute it to verify a request', () => {
    expect(generateToken('assignment-1')).toBe(generateToken('assignment-1'));
  });

  it('should return a different token per assignment, so one token cannot update another assignment', () => {
    expect(generateToken('assignment-1')).not.toBe(generateToken('assignment-2'));
  });
});
