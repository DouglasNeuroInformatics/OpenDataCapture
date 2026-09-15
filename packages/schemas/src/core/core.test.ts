import { describe, expect, it } from 'vitest';

import {
  $Json,
  $LicenseIdentifier,
  $RegexString,
  resolveActiveLanguage,
  toInstrumentAuthoringLanguage
} from './core.js';

describe('$Json', () => {
  it('should accept a value nesting arrays and records of JSON literals', () => {
    expect($Json.safeParse({ a: [1, 'two', true, null, { b: false }] }).success).toBe(true);
  });
  it('should reject a value containing a function', () => {
    expect($Json.safeParse({ a: () => null }).success).toBe(false);
  });
});

describe('resolveActiveLanguage', () => {
  it('should keep a reader on their language while the instance still offers it', () => {
    expect(resolveActiveLanguage('fr', ['en', 'fr'])).toBe('fr');
  });

  it('should move a reader off a deactivated language, which the toggle no longer offers a way out of', () => {
    expect(resolveActiveLanguage('es', ['en', 'fr'])).toBe('en');
  });

  it('should fall back to the first offered language, so the result does not depend on click order', () => {
    expect(resolveActiveLanguage('en', ['fr', 'es'])).toBe('fr');
  });
});

describe('$LicenseIdentifier', () => {
  it('should accept a recognized SPDX identifier', () => {
    expect($LicenseIdentifier.safeParse('MIT').success).toBe(true);
  });
  it('should reject a string not in the license map', () => {
    expect($LicenseIdentifier.safeParse('NOT-A-LICENSE').success).toBe(false);
  });
});

describe('$RegexString', () => {
  it('should accept a string that compiles as a regular expression', () => {
    expect($RegexString.safeParse('^[a-z]+$').success).toBe(true);
  });
  it('should reject a string that is not a valid regular expression', () => {
    expect($RegexString.safeParse('(unterminated').success).toBe(false);
  });
});

describe('toInstrumentAuthoringLanguage', () => {
  it('should pass through an interface language that instruments may be authored in', () => {
    expect(toInstrumentAuthoringLanguage('fr')).toBe('fr');
  });
  it('should fall back to English for an interface language instruments cannot be authored in', () => {
    expect(toInstrumentAuthoringLanguage('es')).toBe('en');
  });
});
