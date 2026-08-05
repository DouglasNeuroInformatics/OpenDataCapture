import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { LocalizedString } from '@opendatacapture/schemas/core';
import { beforeEach, describe, expect, it } from 'vitest';

import { authoredLanguages, omitBlankLanguages, reconcileInterfaceLanguage } from '../language';

import '@/services/i18n';

describe('reconcileInterfaceLanguage', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('should move a reader off a language the instance no longer offers', () => {
    i18n.changeLanguage('es');
    expect(reconcileInterfaceLanguage(['en', 'fr'])).toBe(true);
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should leave a reader on a language the instance still offers', () => {
    i18n.changeLanguage('fr');
    expect(reconcileInterfaceLanguage(['en', 'fr'])).toBe(false);
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should report no change when nothing moved, so it does not notify every translated component', () => {
    expect(reconcileInterfaceLanguage(['en', 'es', 'fr'])).toBe(false);
  });
});

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
