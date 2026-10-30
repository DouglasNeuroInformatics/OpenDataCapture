import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY } from '../useInstrumentRepoSyncLogsQuery';
import {
  latestInstrumentRepoSyncLogsQueryOptions,
  useLatestInstrumentRepoSyncLogsQuery
} from '../useLatestInstrumentRepoSyncLogsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const LOG = {
  action: 'SYNC',
  createdAt: '2026-10-28T12:00:00.000Z',
  failures: [],
  id: 'log-1',
  importedCount: 3,
  message: null,
  repoId: 'repo-1',
  repoName: 'core',
  updatedAt: '2026-10-28T12:00:00.000Z'
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('latestInstrumentRepoSyncLogsQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [LOG] });
  });

  it('should read the one entry per repository, not a page of the history', async () => {
    const logs = await createQueryClient().fetchQuery(latestInstrumentRepoSyncLogsQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-repos/sync/logs/latest');
    expect(logs[0]!.createdAt).toEqual(new Date(LOG.createdAt));
  });

  it('should key under the history prefix, so invalidating the history refreshes it too', () => {
    expect(latestInstrumentRepoSyncLogsQueryOptions().queryKey).toEqual([
      INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY,
      'latest'
    ]);
  });
});

describe('useLatestInstrumentRepoSyncLogsQuery', () => {
  it('should resolve to the latest entries once the suspended request settles', async () => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [LOG] });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    };
    const { result } = renderHook(() => useLatestInstrumentRepoSyncLogsQuery(), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.map((log) => log.repoName)).toEqual(['core']);
  });
});
