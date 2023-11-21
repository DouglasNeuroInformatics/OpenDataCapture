import { describe, expect, it } from 'bun:test';

import { primitiveFieldSchema } from '../schemas/form-instrument.schemas';

describe('primitiveFieldSchema', () => {
  it('should be defined', () => {
    expect(primitiveFieldSchema).toBeDefined();
  });
});
