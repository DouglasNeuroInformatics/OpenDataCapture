import { describe, expect, it } from 'vitest';

import { $Config, type Config } from '../schemas.js';

describe('$Config', () => {
  it('should parse an included package', () => {
    expect(
      $Config.safeParse({
        include: ['jquery__1.0.0'],
        outdir: 'dist'
      } satisfies Config)
    ).toMatchObject({ success: true });
  });
});
