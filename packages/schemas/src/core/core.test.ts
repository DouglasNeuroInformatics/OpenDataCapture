import { describe, expect, it } from 'vitest';

import { $ActiveLanguages, $LocalizedString, LANGUAGES, toInstrumentAuthoringLanguage } from './core.js';

describe('$ActiveLanguages', () => {
  it.each([[['en']], [['es']], [['en', 'fr']], [['en', 'es', 'fr']]])(
    'should accept the offered language set %j',
    (activeLanguages) => {
      expect($ActiveLanguages.safeParse(activeLanguages).success).toBe(true);
    }
  );

  it('should reject an empty set, which would leave every user unable to read the interface', () => {
    expect($ActiveLanguages.safeParse([]).success).toBe(false);
  });

  it.each([[['klingon']], [['en', 'klingon']], [['EN']], [[1]]])(
    'should reject %j, so an unknown code cannot empty the language toggle',
    (activeLanguages) => {
      expect($ActiveLanguages.safeParse(activeLanguages).success).toBe(false);
    }
  );

  it('should type the first entry as present, so consumers need no assertion to read a fallback', () => {
    const parsed = $ActiveLanguages.parse(['es', 'fr']);
    expect(parsed[0]).toBe('es');
  });
});

describe('$LocalizedString', () => {
  it('should accept an entry for every interface language', () => {
    expect($LocalizedString.safeParse({ en: 'Hello', es: 'Hola', fr: 'Bonjour' }).success).toBe(true);
  });

  it('should accept content targeting a single language', () => {
    expect($LocalizedString.safeParse({ es: 'Hola' }).success).toBe(true);
  });

  it('should carry a key for every interface language, so none renders blank', () => {
    const parsed = $LocalizedString.parse({ en: 'Hello', es: 'Hola', fr: 'Bonjour' });
    expect(LANGUAGES.every((language) => language in parsed)).toBe(true);
  });
});

describe('toInstrumentAuthoringLanguage', () => {
  it.each([
    ['en', 'en'],
    ['fr', 'fr']
  ] as const)('should keep %s, which instruments can be authored in', (language, expected) => {
    expect(toInstrumentAuthoringLanguage(language)).toBe(expected);
  });

  it('should record content typed in an interface language instruments do not support as English', () => {
    expect(toInstrumentAuthoringLanguage('es')).toBe('en');
  });
});
