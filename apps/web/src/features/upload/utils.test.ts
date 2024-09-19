// @vitest-environment node

//pnpm exec vitest --dir src/features/upload/ -c /dev/null --run

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { getZodTypeName } from './utils';

describe('getZodTypeName', () => {
  it('should parse a z.string', () => {
    expect(getZodTypeName(z.string())).toBe('ZodString');
  });
});
