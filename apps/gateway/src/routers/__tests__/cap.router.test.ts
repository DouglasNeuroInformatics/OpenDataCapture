import { describe, expect, it } from 'vitest';

import { $VerifyRequest } from '../cap.router';

describe('$VerifyRequest', () => {
  it('should accept an assignment id', () => {
    expect($VerifyRequest.safeParse({ id: crypto.randomUUID(), token: 'token' }).success).toBe(true);
  });

  it('should reject an id longer than any assignment id, since a verified id is kept for the life of the process', () => {
    expect($VerifyRequest.safeParse({ id: 'x'.repeat(10_000), token: 'token' }).success).toBe(false);
  });
});
