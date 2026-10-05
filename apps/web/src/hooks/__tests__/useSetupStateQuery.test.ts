import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SETUP_STATE_QUERY_KEY, setupStateQueryOptions, useSetupStateQuery } from '../useSetupStateQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const setupState = {
  activeLanguages: ['en', 'fr'],
  isDemo: false,
  isGatewayEnabled: true,
  isSetup: true,
  release: { buildTime: 0, type: 'production', version: '1.0.0' },
  uptime: 42
};

function renderSetupStateQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return renderHook(() => useSetupStateQuery(), { wrapper });
}

describe('useSetupStateQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: setupState });
  });

  it('should suspend until the setup state loads from the setup endpoint, then return it', async () => {
    const { result } = renderSetupStateQuery();
    await waitFor(() => expect(result.current?.data).toMatchObject({ isGatewayEnabled: true, isSetup: true }));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/setup');
  });

  it('should reject a response that is not a setup state, so no unparsed flag reaches the app', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { isSetup: 'yes' } });
    await expect(new QueryClient().fetchQuery(setupStateQueryOptions())).rejects.toThrow();
  });

  it('should serve a later read from the cache, so the setup endpoint is not hit again', async () => {
    const queryClient = new QueryClient();
    await queryClient.fetchQuery(setupStateQueryOptions());
    await queryClient.fetchQuery(setupStateQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should refetch once a save invalidates the setup state, so the app reads the new flags', async () => {
    const queryClient = new QueryClient();
    await queryClient.fetchQuery(setupStateQueryOptions());
    await queryClient.invalidateQueries({ queryKey: [SETUP_STATE_QUERY_KEY] });
    await queryClient.fetchQuery(setupStateQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });
});
