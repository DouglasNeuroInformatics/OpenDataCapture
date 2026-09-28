import { describe, expect, it } from 'vitest';

import { resolveLanguage, updateSetupState } from '../setup-state';

describe('resolveLanguage', () => {
  it('should honour a requested language the instance has active', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage('fr')).toBe('fr');
  });

  it('should fall back to the first active language for an inactive one, so a page never renders blank strings', () => {
    updateSetupState({ activeLanguages: ['fr'] });
    expect(resolveLanguage('en')).toBe('fr');
  });

  it('should fall back to the first active language when the request names no language', () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(resolveLanguage(undefined)).toBe('fr');
  });
});
