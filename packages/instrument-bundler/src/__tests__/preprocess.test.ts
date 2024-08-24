import { describe, expect, it } from 'vitest';

import { preprocess } from '../preprocess.js';

describe('preprocess', () => {
  it('should reject an empty array', () => {
    expect(() => preprocess([])).toThrowError('Received empty array for inputs');
  });
  it('should reject non-shallow names', () => {
    expect(() =>
      preprocess([
        { content: "export * from './utils/foo.js'", name: 'index.js' },
        { content: 'export const foo = null', name: 'utils/foo.js' }
      ])
    ).toThrowError(
      "Illegal character '/' in input name 'utils/foo.js': expected shallow relative path (e.g., './foo.js')"
    );
  });
});
