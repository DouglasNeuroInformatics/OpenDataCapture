import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSyncInstrumentRepoMutation } from '../useSyncInstrumentRepoMutation';

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

const syncLog = (failures: { instrumentDir: string; message: string; stage: 'BUNDLE' | 'LOAD' }[] = []) => ({
  action: 'SYNC',
  createdAt: '2026-10-28T00:00:00.000Z',
  failures,
  id: 'log-1',
  importedCount: 3,
  message: null,
  repoId: 'repo-1',
  repoName: 'core',
  updatedAt: '2026-10-28T00:00:00.000Z'
});

function renderSyncMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useSyncInstrumentRepoMutation(), { wrapper }), invalidateQueries };
}

describe('useSyncInstrumentRepoMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: syncLog() });
  });

  it('should sync the repository without the default error toast, since it raises its own', async () => {
    const { result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/instrument-repos/repo-1/sync',
      undefined,
      expect.objectContaining({ meta: expect.objectContaining({ disableDefaultErrorNotification: true }) })
    );
  });

  it('should opt out of the default request timeout, since a sync can outlast it', async () => {
    const { result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/instrument-repos/repo-1/sync',
      undefined,
      expect.objectContaining({ meta: expect.objectContaining({ disableDefaultTimeout: true }) })
    );
  });

  it('should announce the sync before it finishes, since a sync can take a while', async () => {
    mockAxios.post.mockReturnValueOnce(Promise.withResolvers<never>().promise);
    const { result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledExactlyOnceWith({ message: 'Syncing repository...', type: 'info' });
    });
  });

  it('should announce success and refresh the repositories and the instruments a sync may have added', async () => {
    const { invalidateQueries, result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Repository synced successfully', type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repos'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it('should warn rather than announce success when some instruments failed, so they get fixed', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: syncLog([{ instrumentDir: 'PHQ_9', message: 'broken', stage: 'LOAD' }])
    });
    const { result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(addNotification).toHaveBeenLastCalledWith({
      message: 'Repository synced, but 1 instruments failed. See the activity log.',
      type: 'warning'
    });
  });

  it('should refresh the activity log even when the sync fails, because the failure is logged too', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('down'));
    const { invalidateQueries, result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repo-sync-logs'] });
  });

  it('should report the reason the server gave when the sync fails', async () => {
    mockAxios.isAxiosError.mockReturnValueOnce(true);
    mockAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Repository not found' } } });
    const { result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Repository not found', type: 'error' });
  });

  it('should fall back to a generic failure message when the server gives no reason', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Failed to sync repository', type: 'error' });
  });

  it('should report a rejection through its own notification without escaping to the route error boundary', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenCalledWith({ message: 'Failed to sync repository', type: 'error' });
  });
});
