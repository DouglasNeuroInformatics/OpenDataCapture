import { describe, expect, it } from 'vitest';

import { cap } from '../cap';

describe('cap', () => {
  it('should keep challenge state in memory, so the gateway needs no writable state file', () => {
    expect(cap.config.noFSState).toBe(true);
  });
});
