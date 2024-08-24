import { describe, expect, it } from 'vitest';

import { $BundleOptions } from '../schemas.js';

describe('$BundlerOptions', () => {
  it('should parse valid options', () => {
    expect($BundleOptions.safeParse({ inputs: [{ content: new Uint8Array(), name: 'style.css' }] })).toMatchObject({
      success: true
    });
  });
});
