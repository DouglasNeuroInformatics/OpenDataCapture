import { createElement } from 'react';
import type { ReactNode } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import { isRedirect } from '@tanstack/react-router';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/route';

const mocks = vi.hoisted(() => {
  const store = {
    accessToken: null as null | string,
    currentUser: null as null | { mustResetPassword: boolean },
    login: (accessToken: string) => {
      store.accessToken = accessToken;
    }
  };
  return {
    axios: { post: vi.fn() },
    config: { dev: { isBypassAuthEnabled: false, password: 'password', username: 'dev' } },
    store
  };
});

vi.mock('axios', () => ({ default: mocks.axios }));
vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/store', () => ({ useAppStore: { getState: () => mocks.store } }));

const components = await vi.hoisted(async () => {
  const React = await import('react');
  const wrapper =
    (testId: string) =>
    ({ children }: { children: ReactNode }) =>
      React.createElement('div', { 'data-testid': testId }, children);
  return {
    DisclaimerProvider: wrapper('disclaimer-provider'),
    ForceClearQueryCacheProvider: wrapper('force-clear-query-cache-provider'),
    Layout: () => React.createElement('main', { 'data-testid': 'layout' }),
    WalkthroughProvider: wrapper('walkthrough-provider')
  };
});

vi.mock('@/components/Layout', () => ({ Layout: components.Layout }));
vi.mock('@/providers/DisclaimerProvider', () => ({ DisclaimerProvider: components.DisclaimerProvider }));
vi.mock('@/providers/WalkthroughProvider', () => ({ WalkthroughProvider: components.WalkthroughProvider }));
vi.mock('@/providers/ForceClearQueryCacheProvider', () => ({
  ForceClearQueryCacheProvider: components.ForceClearQueryCacheProvider
}));

const runGuard = async (setupState: { activeLanguages?: ActiveLanguages; isSetup?: boolean } = {}) => {
  const beforeLoad = Route.options.beforeLoad as (opts: object) => Promise<void>;
  const queryClient = {
    fetchQuery: vi.fn().mockResolvedValue({ activeLanguages: ['en', 'fr'], isSetup: true, ...setupState })
  };
  try {
    await beforeLoad({ context: { queryClient } });
  } catch (err) {
    return err;
  }
  return null;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.store.accessToken = null;
  mocks.store.currentUser = null;
  mocks.config.dev.isBypassAuthEnabled = false;
  mocks.axios.post.mockResolvedValue({ data: { accessToken: 'dev-token' } });
  vi.stubEnv('DEV', true);
  vi.stubEnv('MODE', 'development');
});

afterEach(() => {
  vi.unstubAllEnvs();
  i18n.changeLanguage('en');
});

describe('_app guard', () => {
  it('should redirect to the setup page before anything else when the instance is not set up', async () => {
    mocks.store.accessToken = 'token';
    const thrown = await runGuard({ isSetup: false });
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/setup' } });
  });

  it('should redirect an unauthenticated user to the login page', async () => {
    const thrown = await runGuard();
    expect(isRedirect(thrown)).toBe(true);
    expect((thrown as { options: { to: string } }).options.to).toBe('/auth/login');
  });

  it('should log in as the dev user without redirecting when auth bypass is enabled, so a direct link opens the page it names', async () => {
    mocks.config.dev.isBypassAuthEnabled = true;
    expect(await runGuard()).toBeNull();
    expect(mocks.axios.post).toHaveBeenCalledWith('/v1/auth/login', { password: 'password', username: 'dev' });
    expect(mocks.store.accessToken).toBe('dev-token');
  });

  it('should ignore auth bypass in test mode, so the e2e suite exercises the real login', async () => {
    mocks.config.dev.isBypassAuthEnabled = true;
    vi.stubEnv('MODE', 'test');
    expect(isRedirect(await runGuard())).toBe(true);
  });

  it('should ignore auth bypass in a production build, so a misconfigured deployment still requires a login', async () => {
    mocks.config.dev.isBypassAuthEnabled = true;
    vi.stubEnv('DEV', false);
    expect(isRedirect(await runGuard())).toBe(true);
    expect(mocks.axios.post).not.toHaveBeenCalled();
  });

  it('should let an authenticated user through without logging in again', async () => {
    mocks.store.accessToken = 'token';
    expect(await runGuard()).toBeNull();
    expect(mocks.axios.post).not.toHaveBeenCalled();
  });

  it('should lock a user who must reset their password onto the reset page', async () => {
    mocks.store.accessToken = 'token';
    mocks.store.currentUser = { mustResetPassword: true };
    const thrown = await runGuard();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/auth/reset-password' } });
  });

  it('should switch the interface to an active language before rendering, so a deactivated language is never shown', async () => {
    i18n.changeLanguage('en');
    mocks.store.accessToken = 'token';
    await runGuard({ activeLanguages: ['fr'] });
    expect(i18n.resolvedLanguage).toBe('fr');
  });

  it('should keep a reader on a language the instance still offers', async () => {
    i18n.changeLanguage('fr');
    mocks.store.accessToken = 'token';
    await runGuard({ activeLanguages: ['en', 'fr'] });
    expect(i18n.resolvedLanguage).toBe('fr');
  });
});

describe('_app layout', () => {
  afterEach(cleanup);

  it('should render the layout inside the disclaimer, walkthrough and cache providers, in that order', () => {
    render(createElement(Route.options.component!));
    const layout = screen.getByTestId('layout');
    const cacheProvider = screen.getByTestId('force-clear-query-cache-provider');
    const walkthroughProvider = screen.getByTestId('walkthrough-provider');
    expect(layout.parentElement).toBe(cacheProvider);
    expect(cacheProvider.parentElement).toBe(walkthroughProvider);
    expect(walkthroughProvider.parentElement).toBe(screen.getByTestId('disclaimer-provider'));
  });
});
