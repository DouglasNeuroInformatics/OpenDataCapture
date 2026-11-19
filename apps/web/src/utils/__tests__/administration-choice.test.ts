import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { describe, expect, it } from 'vitest';

import { getAdministrationChoice } from '../administration-choice';

function createInfo(supportedLanguages: string[]): TranslatedInstrumentInfo {
  return {
    details: { title: 'a' },
    id: 'a-1',
    internal: { edition: 1, name: 'a' },
    kind: 'FORM',
    supportedLanguages
  } as unknown as TranslatedInstrumentInfo;
}

describe('getAdministrationChoice', () => {
  it('should return the preferred language when the instrument offers it', () => {
    const result = getAdministrationChoice(createInfo(['en', 'fr']), { preferredLanguage: 'fr' });
    expect(result.language).toBe('fr');
  });

  it('should fall back to the first offered language when the preferred one is not offered', () => {
    const result = getAdministrationChoice(createInfo(['fr']), { preferredLanguage: 'en' });
    expect(result.language).toBe('fr');
  });

  it('should offer only the allowed languages, so a language the instance turned off is not offered', () => {
    const result = getAdministrationChoice(createInfo(['en', 'fr']), {
      allowedLanguages: ['fr'],
      preferredLanguage: 'en'
    });
    expect(result.languageOptions).toStrictEqual(['fr']);
  });

  it('should leave the language undefined when the instrument offers no allowed language', () => {
    const result = getAdministrationChoice(createInfo(['en']), {
      allowedLanguages: ['fr'],
      preferredLanguage: 'en'
    });
    expect(result.language).toBeUndefined();
  });
});
