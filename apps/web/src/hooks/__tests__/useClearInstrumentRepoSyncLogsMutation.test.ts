import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useClearInstrumentRepoSyncLogsMutation } from '../useClearInstrumentRepoSyncLogsMutation';

const mockAxios = vi.hoisted(() => ({ delete: vi.fn(), isAxiosError: vi.fn(() => false) }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    resolvedLanguage: 'en',
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

function renderClearMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useClearInstrumentRepoSyncLogsMutation(), { wrapper }), invalidateQueries };
}

describe('useClearInstrumentRepoSyncLogsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.delete.mockResolvedValue({ data: { count: 2 } });
  });

  it('should delete the activity log without the default error toast, since it raises its own', async () => {
    const { result } = renderClearMutation();
    await result.current.mutateAsync();
    expect(mockAxios.delete).toHaveBeenCalledWith('/v1/instrument-repos/sync/logs', {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce the history was cleared and refresh it', async () => {
    const { invalidateQueries, result } = renderClearMutation();
    await result.current.mutateAsync();
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Activity log cleared', type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repo-sync-logs'] });
  });

  it('should report a failure to clear the history', async () => {
    mockAxios.delete.mockRejectedValueOnce(new Error('network'));
    const { result } = renderClearMutation();
    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenLastCalledWith({ message: 'Failed to clear the activity log', type: 'error' });
  });
});
