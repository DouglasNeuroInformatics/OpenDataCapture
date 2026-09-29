import { DEFAULT_ACTIVE_LANGUAGES } from '@opendatacapture/schemas/core';
import { describe, expect, it, vi } from 'vitest';

import { resolveLanguage, updateSetupState } from '../setup-state';

describe('getActiveLanguages', () => {
  it('should offer the default languages until the API first pushes its setup state, so a patient can pick any of them straight after a gateway restart', async () => {
    vi.resetModules();
    const { getActiveLanguages } = await import('../setup-state');
    expect(getActiveLanguages()).toEqual(DEFAULT_ACTIVE_LANGUAGES);
  });
});

describe('resolveLanguage', () => {
  it('should honour a requested language the instance has active', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage('fr')).toBe('fr');
  });

  it('should fall back to the first active language for an inactive one, so a patient is never served a language the instance has turned off', () => {
    updateSetupState({ activeLanguages: ['fr'] });
    expect(resolveLanguage('en')).toBe('fr');
  });

  it('should fall back to the first active language when the request names no language', () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(resolveLanguage(undefined)).toBe('fr');
  });

  it('should fall back to the first active language for an unrecognised code, so a malformed link still renders', () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(resolveLanguage('klingon')).toBe('fr');
  });

  it('should fall back to the first active language for a repeated `lang` parameter, which Express parses into an array', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(['fr', 'en'])).toBe('en');
  });
});
