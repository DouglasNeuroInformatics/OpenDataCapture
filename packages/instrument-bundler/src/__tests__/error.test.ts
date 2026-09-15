import { describe, expect, it } from 'vitest';

import { InstrumentBundlerError } from '../error.js';

describe('InstrumentBundlerError.isInstance', () => {
  it('should return true for an InstrumentBundlerError carrying the given kind', () => {
    const error = new InstrumentBundlerError('Failed to Compile', {
      cause: new Error('boom'),
      kind: 'ESBUILD_FAILURE'
    });
    expect(InstrumentBundlerError.isInstance(error, 'ESBUILD_FAILURE')).toBe(true);
  });

  it('should return false for an InstrumentBundlerError carrying a different kind', () => {
    const error = new InstrumentBundlerError('Something else went wrong');
    expect(InstrumentBundlerError.isInstance(error, 'ESBUILD_FAILURE')).toBe(false);
  });

  it('should return false for a value that is not an InstrumentBundlerError', () => {
    expect(InstrumentBundlerError.isInstance(new Error('plain error'), 'ESBUILD_FAILURE')).toBe(false);
  });
});
