import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSyncAllInstrumentReposMutation } from '../useSyncAllInstrumentReposMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    resolvedLanguage: 'en',
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

const syncLog = ({
  failures = [],
  message = null
}: {
  failures?: { instrumentDir: string; message: string; stage: 'BUNDLE' | 'LOAD' }[];
  message?: null | string;
} = {}) => ({
  action: 'SYNC',
  createdAt: '2026-10-28T00:00:00.000Z',
  failures,
  id: 'log-1',
  importedCount: 3,
  message,
  repoId: 'repo-1',
  repoName: 'core',
  updatedAt: '2026-10-28T00:00:00.000Z'
});

function renderSyncAllMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useSyncAllInstrumentReposMutation(), { wrapper }), invalidateQueries };
}

describe('useSyncAllInstrumentReposMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: [syncLog(), syncLog()] });
  });

  it('should sync every repository without the default timeout, since syncing them all can outlast it', async () => {
    const { result } = renderSyncAllMutation();
    await result.current.mutateAsync();
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/instrument-repos/sync/all',
      undefined,
      expect.objectContaining({
        meta: expect.objectContaining({ disableDefaultErrorNotification: true, disableDefaultTimeout: true })
      })
    );
  });

  it('should announce the sync before it finishes, since syncing every repository takes a while', async () => {
    mockAxios.post.mockReturnValueOnce(new Promise(() => undefined));
    const { result } = renderSyncAllMutation();
    result.current.mutate();
    await waitFor(() =>
      expect(addNotification).toHaveBeenCalledExactlyOnceWith({ message: 'Syncing every repository...', type: 'info' })
    );
  });

  it('should announce success and refresh the repositories, their history and their instruments', async () => {
    const { invalidateQueries, result } = renderSyncAllMutation();
    await result.current.mutateAsync();
    expect(addNotification).toHaveBeenLastCalledWith({
      message: 'Synced 2 repositories successfully',
      type: 'success'
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repos'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repo-sync-logs'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it('should warn with how many repositories had a failed instrument or could not be read', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: [
        syncLog({ failures: [{ instrumentDir: 'PHQ_9', message: 'broken', stage: 'LOAD' }] }),
        syncLog({ message: 'Repository not found' }),
        syncLog()
      ]
    });
    const { result } = renderSyncAllMutation();
    await result.current.mutateAsync();
    expect(addNotification).toHaveBeenLastCalledWith({
      message: '2 of 3 repositories had problems. See the sync history.',
      type: 'warning'
    });
  });

  it('should report the reason the server gave when the request fails', async () => {
    mockAxios.isAxiosError.mockReturnValueOnce(true);
    mockAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Forbidden' } } });
    const { result } = renderSyncAllMutation();
    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Forbidden', type: 'error' });
  });

  it('should fall back to a generic message when the server gives no reason', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('network'));
    const { result } = renderSyncAllMutation();
    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Failed to sync repositories', type: 'error' });
  });
});
