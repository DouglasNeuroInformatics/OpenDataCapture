import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

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

const PAGE = { data: [LOG], pageCount: 2, total: 15 };

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('instrumentRepoSyncLogsQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: PAGE });
  });

  it('should parse the page so each log time arrives as a Date', async () => {
    const page = await createQueryClient().fetchQuery(instrumentRepoSyncLogsQueryOptions());
    expect(page.data[0]!.createdAt).toEqual(new Date(LOG.createdAt));
  });

  it('should ask for a page of the default size, so one request is never the whole history', async () => {
    await createQueryClient().fetchQuery(instrumentRepoSyncLogsQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-repos/sync/logs', { params: { limit: 10 } });
  });

  it('should pass the page, order and repository asked for, since the server does all three', async () => {
    await createQueryClient().fetchQuery(
      instrumentRepoSyncLogsQueryOptions({ params: { page: 3, repoId: 'repo-1', sortOrder: 'asc' } })
    );
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-repos/sync/logs', {
      params: { limit: 10, page: 3, repoId: 'repo-1', sortOrder: 'asc' }
    });
  });

  it('should reject a failure from a stage the server does not define', async () => {
    mockAxios.get.mockResolvedValue({
      data: { ...PAGE, data: [{ ...LOG, failures: [{ ...LOG.failures[0], stage: 'RENDER' }] }] }
    });
    await expect(createQueryClient().fetchQuery(instrumentRepoSyncLogsQueryOptions())).rejects.toThrow(
      /invalid option/i
    );
  });

  it('should key the cache on every parameter, so paging does not serve a stale page', () => {
    const params = { page: 2, sortOrder: 'desc' } as const;
    expect(instrumentRepoSyncLogsQueryOptions({ params }).queryKey).toEqual([
      INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY,
      params
    ]);
  });

  it('should key under the shared prefix, so the repo mutations can invalidate every page at once', () => {
    expect(instrumentRepoSyncLogsQueryOptions().queryKey[0]).toBe(INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY);
  });
});

describe('useInstrumentRepoSyncLogsQuery', () => {
  it('should resolve to the requested page once the request settles', async () => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: PAGE });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => {
      return createElement(QueryClientProvider, { client: queryClient }, children);
    };
    const { result } = renderHook(() => useInstrumentRepoSyncLogsQuery(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(result.current.data?.data.map((log) => log.repoName)).toEqual(['core']);
    expect(result.current.data?.pageCount).toBe(2);
  });
});
