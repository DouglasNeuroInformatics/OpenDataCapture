import type { LocalizedString } from '@opendatacapture/schemas/core';
import { describe, expect, it } from 'vitest';

import { authoredLanguages, getValueForLanguage, omitBlankLanguages } from '../language';
import { UploadError } from '../upload';

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

describe('getValueForLanguage', () => {
  it('should prefer the language the reader is using when it is present', () => {
    expect(getValueForLanguage({ en: 'Hello', es: 'Hola', fr: 'Bonjour' }, 'es')).toBe('Hola');
  });

  it('should fall back rather than return nothing when that language is absent', () => {
    expect(getValueForLanguage({ en: 'Hello', fr: 'Bonjour' }, 'es')).toBe('Hello');
  });

  // A blank entry is what the upload error page used to produce for Spanish, so skipping it is the
  // difference between showing English and showing an empty paragraph.
  it('should skip a blank entry instead of treating it as content', () => {
    expect(getValueForLanguage({ en: 'Hello', es: '   ' }, 'es')).toBe('Hello');
  });

  // Every `UploadError` in `../upload` is authored in English and French only, so the upload error
  // page resolves through this rather than reading `description[resolvedLanguage]` directly.
  it('should render an upload error in English for a Spanish reader, since none carry Spanish', () => {
    const { description } = new UploadError({
      en: 'Record in the record array was left undefined',
      fr: `L'enregistrement dans le tableau d'enregistrements n'est pas défini`
    });
    expect(getValueForLanguage(description, 'es')).toBe('Record in the record array was left undefined');
  });
});
