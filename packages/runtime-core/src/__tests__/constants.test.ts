import { describe, expect, it } from 'vitest';

import { FILE_TYPES } from '../constants.js';

describe('FILE_TYPES', () => {
  it('should be frozen, so instruments cannot widen the accepted file types at runtime', () => {
    expect(Object.isFrozen(FILE_TYPES)).toBe(true);
    expect(Object.values(FILE_TYPES).every((mimeTypes) => Object.isFrozen(mimeTypes))).toBe(true);
  });

  it('should group MIME types by category, so a file instrument can accept a whole category', () => {
    expect(FILE_TYPES.images).toContain('image/png');
    expect(FILE_TYPES.spreadsheets).toContain('text/csv');
    expect(FILE_TYPES.structured).toEqual(['application/json', 'application/xml']);
  });
});
