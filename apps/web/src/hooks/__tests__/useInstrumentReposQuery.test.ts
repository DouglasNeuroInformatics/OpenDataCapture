import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  INSTRUMENT_REPOS_QUERY_KEY,
  instrumentReposQueryOptions,
  useInstrumentReposQuery
} from '../useInstrumentReposQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const REPO = {
  createdAt: '2025-01-01T00:00:00.000Z',
  groupIds: [],
  id: 'repo-1',
  instrumentIds: [],
  lastSyncedAt: '2025-01-03T00:00:00.000Z',
  name: 'My Repo',
  owner: 'douglasneuroinformatics',
  repoName: 'my-repo',
  updatedAt: '2025-01-02T00:00:00.000Z',
  url: 'https://github.com/douglasneuroinformatics/my-repo'
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('instrumentReposQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [REPO] });
  });

  it('should parse the repos so the last sync time arrives as a Date', async () => {
    const repos = await createQueryClient().fetchQuery(instrumentReposQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-repos');
    expect(repos[0]!.lastSyncedAt).toEqual(new Date(REPO.lastSyncedAt));
  });

  it('should reject a repo whose url is not a url', async () => {
    mockAxios.get.mockResolvedValue({ data: [{ ...REPO, url: 'not a url' }] });
    await expect(createQueryClient().fetchQuery(instrumentReposQueryOptions())).rejects.toThrow();
  });

  it('should cache under the shared key, so the repo mutations can invalidate it', () => {
    expect(instrumentReposQueryOptions().queryKey).toEqual([INSTRUMENT_REPOS_QUERY_KEY]);
  });
});

describe('useInstrumentReposQuery', () => {
  it('should resolve to the repos once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: [REPO] });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useInstrumentReposQuery(), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.map((repo) => repo.name)).toEqual(['My Repo']);
  });
});
