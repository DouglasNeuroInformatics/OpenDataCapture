import { describe, expect, it } from 'vitest';

import { sha256 } from './hash.js';

describe('sha256', () => {
  it('should generate the same hash given the same inputs', async () => {
    const h1 = await sha256('foo');
    const h2 = await sha256('foo');
    expect(h1).toBe(h2);
  });
  it('should generate different hashes given different inputs', async () => {
    const h1 = await sha256('bar');
    const h2 = await sha256('foo');
    expect(h1).not.toBe(h2);
  });
});
