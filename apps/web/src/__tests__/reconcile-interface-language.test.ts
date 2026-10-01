import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/route';
import { reconcileInterfaceLanguage } from '@/services/i18n';
import { useAppStore } from '@/store';

vi.mock('@/config', () => ({
  config: {
    dev: {},
    meta: { contactEmail: '', docsUrl: '', githubRepoUrl: '', licenseUrl: '' },
    setup: { apiBaseUrl: '', isGatewayEnabled: true }
  }
}));

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

describe('_app beforeLoad', () => {
  const runBeforeLoad = async (activeLanguages: ActiveLanguages) => {
    const queryClient = { fetchQuery: vi.fn().mockResolvedValue({ activeLanguages, isSetup: true }) };
    const beforeLoad = Route.options.beforeLoad as (opts: {
      context: { queryClient: Pick<QueryClient, 'fetchQuery'> };
    }) => Promise<void>;
    await beforeLoad({ context: { queryClient } });
  };

  beforeEach(() => {
    i18n.changeLanguage('en');
    useAppStore.setState({ accessToken: 'token', currentUser: null });
  });

  it('should move a stranded reader before the app renders, so every component mounts in an offered language', async () => {
    i18n.changeLanguage('es');
    await runBeforeLoad(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('en');
  });

  it('should keep a reader on a language the instance still offers', async () => {
    i18n.changeLanguage('fr');
    await runBeforeLoad(['en', 'fr']);
    expect(i18n.resolvedLanguage).toBe('fr');
  });
});
