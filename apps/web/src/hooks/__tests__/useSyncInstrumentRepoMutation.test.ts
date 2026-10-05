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

function renderSyncMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useSyncInstrumentRepoMutation(), { wrapper }), invalidateQueries };
}

describe('useSyncInstrumentRepoMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should sync the repository without the default error toast, since it raises its own', async () => {
    const { result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/instrument-repos/repo-1/sync', undefined, {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce the sync before it finishes, since a sync can take a while', async () => {
    mockAxios.post.mockReturnValueOnce(new Promise(() => undefined));
    const { result } = renderSyncMutation();
    result.current.mutate({ id: 'repo-1' });
    await waitFor(() =>
      expect(addNotification).toHaveBeenCalledExactlyOnceWith({ message: 'Syncing repository...', type: 'info' })
    );
  });

  it('should announce success and refresh the repositories and the instruments a sync may have added', async () => {
    const { invalidateQueries, result } = renderSyncMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Repository synced successfully', type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repos'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
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
});
