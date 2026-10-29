import { describe, expect, it } from 'vitest';

import { clearAssignmentVerification, isAssignmentVerified, markAssignmentVerified } from '../assignment-verification';

describe('isAssignmentVerified', () => {
  it('should not treat an assignment as verified before its subject solves the challenge', () => {
    expect(isAssignmentVerified('assignment-unverified')).toBe(false);
  });
});

describe('markAssignmentVerified', () => {
  it('should treat an assignment as verified once it is marked, so later submissions skip the expired token', () => {
    markAssignmentVerified('assignment-marked');
    expect(isAssignmentVerified('assignment-marked')).toBe(true);
  });

  it('should scope verification to the marked assignment, so one solved challenge does not unlock another', () => {
    markAssignmentVerified('assignment-a');
    expect(isAssignmentVerified('assignment-b')).toBe(false);
  });
});

describe('clearAssignmentVerification', () => {
  it('should revoke verification once cleared, so a finished assignment cannot be resubmitted', () => {
    markAssignmentVerified('assignment-cleared');
    clearAssignmentVerification('assignment-cleared');
    expect(isAssignmentVerified('assignment-cleared')).toBe(false);
  });
});
