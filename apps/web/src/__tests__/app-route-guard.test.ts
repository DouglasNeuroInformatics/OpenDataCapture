import { isRedirect } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/route';

const mocks = vi.hoisted(() => {
  const store = {
    accessToken: null as null | string,
    currentUser: null,
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

const runGuard = async () => {
  const beforeLoad = Route.options.beforeLoad as (opts: object) => Promise<void>;
  const queryClient = { fetchQuery: vi.fn().mockResolvedValue({ isSetup: true }) };
  try {
    await beforeLoad({ context: { queryClient } });
  } catch (err) {
    return err;
  }
  return null;
};

beforeEach(() => {
  mocks.store.accessToken = null;
  mocks.config.dev.isBypassAuthEnabled = false;
  mocks.axios.post.mockResolvedValue({ data: { accessToken: 'dev-token' } });
  vi.stubEnv('DEV', true);
  vi.stubEnv('MODE', 'development');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('_app guard', () => {
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
});
