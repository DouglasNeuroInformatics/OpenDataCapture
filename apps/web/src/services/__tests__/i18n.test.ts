import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileInterfaceLanguage } from '@/services/i18n';

describe('reconcileInterfaceLanguage', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should move a reader off a language the instance no longer offers', () => {
    i18n.changeLanguage('es');
    reconcileInterfaceLanguage(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should leave a reader on a language the instance still offers', () => {
    i18n.changeLanguage('fr');
    reconcileInterfaceLanguage(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should not change the language when nothing moved, so it does not notify every translated component', () => {
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage');
    reconcileInterfaceLanguage(['en', 'es', 'fr']);
    expect(changeLanguage).not.toHaveBeenCalled();
  });
});
