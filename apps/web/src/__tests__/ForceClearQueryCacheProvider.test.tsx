import { Fragment } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  config: { dev: { isForceClearQueryCacheEnabled: false } },
  location: { pathname: '/dashboard' }
}));

vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useLocation: () => mocks.location
}));

const CHILD_TEXT = 'Page';

const loadProvider = async (isForceClearQueryCacheEnabled: boolean) => {
  mocks.config.dev.isForceClearQueryCacheEnabled = isForceClearQueryCacheEnabled;
  vi.resetModules();
  const { ForceClearQueryCacheProvider } = await import('@/providers/ForceClearQueryCacheProvider');
  return ForceClearQueryCacheProvider;
};

const renderWithQueryClient = async () => {
  const ForceClearQueryCacheProvider = await loadProvider(true);
  const queryClient = new QueryClient();
  const clear = vi.spyOn(queryClient, 'clear');
  const tree = () => (
    <QueryClientProvider client={queryClient}>
      <ForceClearQueryCacheProvider>
        <p>{CHILD_TEXT}</p>
      </ForceClearQueryCacheProvider>
    </QueryClientProvider>
  );
  const { rerender } = render(tree());
  return { clear, rerender: () => rerender(tree()) };
};

beforeEach(() => {
  mocks.location.pathname = '/dashboard';
});

afterEach(cleanup);

describe('ForceClearQueryCacheProvider', () => {
  it('should be a plain fragment when the dev flag is off, so production pays nothing for it', async () => {
    expect(await loadProvider(false)).toBe(Fragment);
  });

  it('should render its children when the dev flag is on', async () => {
    await renderWithQueryClient();
    expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
  });

  it('should clear the query cache on mount when the dev flag is on', async () => {
    const { clear } = await renderWithQueryClient();
    expect(clear).toHaveBeenCalledOnce();
  });

  it('should clear the query cache again on navigation, so every page refetches from the api', async () => {
    const { clear, rerender } = await renderWithQueryClient();
    mocks.location.pathname = '/datahub';
    rerender();
    expect(clear).toHaveBeenCalledTimes(2);
  });

  it('should not clear the query cache on a rerender that stays on the same page', async () => {
    const { clear, rerender } = await renderWithQueryClient();
    rerender();
    expect(clear).toHaveBeenCalledOnce();
  });
});
