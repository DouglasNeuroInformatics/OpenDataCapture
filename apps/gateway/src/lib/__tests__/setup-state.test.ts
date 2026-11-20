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

  it('should open a link with no language in the language the browser asks for', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(undefined, 'fr-CA,fr;q=0.9,en;q=0.8')).toBe('fr');
  });

  it('should fall back to the browser for a link pinned to a language the instance has since turned off', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage('es', 'fr-CA,fr;q=0.9')).toBe('fr');
  });

  it('should prefer the language the link names over the one the browser asks for', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage('en', 'fr-CA,fr;q=0.9')).toBe('en');
  });

  it('should take the most wanted language the instance has active, not merely the first listed', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(undefined, 'de;q=0.9,fr;q=0.8,en;q=0.7')).toBe('fr');
  });

  it('should order by quality rather than by the order the header lists them', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(undefined, 'en;q=0.3,fr;q=0.9')).toBe('fr');
  });

  it('should ignore a language the browser explicitly refuses with q=0', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(undefined, 'fr;q=0,en;q=0.5')).toBe('en');
  });

  it('should fall back to the first active language when the browser asks for none it has', () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(resolveLanguage(undefined, 'de,it')).toBe('fr');
  });

  it('should fall back to the first active language for a header it cannot read', () => {
    updateSetupState({ activeLanguages: ['fr', 'en'] });
    expect(resolveLanguage(undefined, ';;;')).toBe('fr');
  });

  it('should treat an unreadable quality as the strongest preference, since the language was still named', () => {
    updateSetupState({ activeLanguages: ['en', 'fr'] });
    expect(resolveLanguage(undefined, 'fr;q=high,en;q=0.9')).toBe('fr');
  });
});
