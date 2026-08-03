import type { LocalizedString } from '@opendatacapture/schemas/core';
import { describe, expect, it } from 'vitest';

import { authoredLanguages, omitBlankLanguages } from '../language';

describe('authoredLanguages', () => {
  it('should list only the languages with non-blank content, in a stable order', () => {
    expect(authoredLanguages({ en: 'Hello', fr: 'Bonjour' })).toEqual(['en', 'fr']);
    expect(authoredLanguages({ fr: 'Bonjour' })).toEqual(['fr']);
  });

  it('should not count a whitespace-only entry as authored', () => {
    expect(authoredLanguages({ en: '   ', fr: 'Bonjour' })).toEqual(['fr']);
  });

  it('should be empty for a nullish value', () => {
    expect(authoredLanguages(null)).toEqual([]);
    expect(authoredLanguages(undefined)).toEqual([]);
  });
});

describe('omitBlankLanguages', () => {
  it('should keep only the authored languages', () => {
    expect(omitBlankLanguages({ en: 'Hello', fr: '' })).toEqual({ en: 'Hello' });
  });

  it('should drop a whitespace-only entry', () => {
    expect(omitBlankLanguages({ en: 'Hello', fr: '   ' })).toEqual({ en: 'Hello' });
  });

  // The function's whole reason for iterating LANGUAGES rather than the value's own keys.
  it('should drop a key that is not a known language, so it never reaches the API', () => {
    const value = { en: 'Hello', xx: 'Junk' } as LocalizedString;
    expect(omitBlankLanguages(value)).toEqual({ en: 'Hello' });
  });
});
