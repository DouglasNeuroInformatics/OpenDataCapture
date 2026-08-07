import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { beforeEach, describe, expect, it } from 'vitest';

import { reconcileInterfaceLanguage } from '@/services/i18n';

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
