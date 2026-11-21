import { describe, expect, it } from 'vitest';

import { getLinkLanguage } from '../assignment-link';

describe('getLinkLanguage', () => {
  it('should read the language the link opens the instrument in', () => {
    expect(getLinkLanguage('https://gateway.example/assignments/a-1?lang=fr')).toBe('fr');
  });

  it('should read nothing from a link created without a language, which the gateway chooses for', () => {
    expect(getLinkLanguage('https://gateway.example/assignments/a-1')).toBeUndefined();
  });

  it('should read nothing from a language the application does not have, rather than trust the URL', () => {
    expect(getLinkLanguage('https://gateway.example/assignments/a-1?lang=klingon')).toBeUndefined();
  });
});
