import { describe, expect, it } from 'vitest';

import { LANGUAGE_LABELS, toLanguageToggleOptions } from '../language.js';

describe('toLanguageToggleOptions', () => {
  it('should label each language with its own autonym', () => {
    expect(toLanguageToggleOptions(['en', 'fr'])).toEqual({
      en: LANGUAGE_LABELS.en.en,
      fr: LANGUAGE_LABELS.fr.fr
    });
  });

  it('should return an empty object for an empty language list', () => {
    expect(toLanguageToggleOptions([])).toEqual({});
  });
});
