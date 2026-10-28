import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY,
  instrumentRepoSyncLogsQueryOptions,
  useInstrumentRepoSyncLogsQuery
} from '../useInstrumentRepoSyncLogsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const LOG = {
  action: 'SYNC',
  createdAt: '2026-10-28T12:00:00.000Z',
  failures: [{ instrumentDir: 'PHQ_9', message: 'broken', stage: 'LOAD' }],
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

describe('instrumentRepoSyncLogsQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [LOG] });
  });

  it('should parse the history so each log time arrives as a Date', async () => {
    const logs = await createQueryClient().fetchQuery(instrumentRepoSyncLogsQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-repos/sync/logs');
    expect(logs[0]!.createdAt).toEqual(new Date(LOG.createdAt));
  });

  it('should reject a failure from a stage the server does not define', async () => {
    mockAxios.get.mockResolvedValue({ data: [{ ...LOG, failures: [{ ...LOG.failures[0], stage: 'RENDER' }] }] });
    await expect(createQueryClient().fetchQuery(instrumentRepoSyncLogsQueryOptions())).rejects.toThrow();
  });

  it('should cache under the shared key, so the repo mutations can invalidate it', () => {
    expect(instrumentRepoSyncLogsQueryOptions().queryKey).toEqual([INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY]);
  });
});

describe('useInstrumentRepoSyncLogsQuery', () => {
  it('should resolve to the history once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: [LOG] });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useInstrumentRepoSyncLogsQuery(), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.map((log) => log.repoName)).toEqual(['core']);
  });
});
