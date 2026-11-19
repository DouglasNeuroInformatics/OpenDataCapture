import { describe, expect, it } from 'vitest';

import { withLinkLanguage } from '../assignments.utils';

describe('withLinkLanguage', () => {
  it('should add ?lang= to a link with no query', () => {
    expect(withLinkLanguage('https://gateway.example/assignments/abc', 'fr')).toBe(
      'https://gateway.example/assignments/abc?lang=fr'
    );
  });

  it('should replace a language already on the link rather than name two', () => {
    expect(withLinkLanguage('https://gateway.example/assignments/abc?lang=en', 'es')).toBe(
      'https://gateway.example/assignments/abc?lang=es'
    );
  });

  it('should keep other query parameters', () => {
    expect(withLinkLanguage('https://gateway.example/assignments/abc?x=1', 'en')).toBe(
      'https://gateway.example/assignments/abc?x=1&lang=en'
    );
  });
});
