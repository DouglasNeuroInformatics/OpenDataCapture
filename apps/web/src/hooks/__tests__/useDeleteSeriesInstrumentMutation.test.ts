import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteSeriesInstrumentMutation } from '../useDeleteSeriesInstrumentMutation';

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

// The app default is `throwOnError: true`; the hook overrides it. Mirroring the real default here is what
// makes the rejection case meaningful — without the override it would escape to the route error boundary.
function renderDeleteMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { throwOnError: true } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useDeleteSeriesInstrumentMutation(), { wrapper }), queryClient };
}

describe('useDeleteSeriesInstrumentMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the instrument and invalidates the instrument list', async () => {
    mockAxios.delete.mockResolvedValue({ data: { id: 'series-1' } });
    const { queryClient, result } = renderDeleteMutation();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ id: 'series-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.delete).toHaveBeenCalledWith('/v1/instruments/series-1', {
      meta: { disableDefaultErrorNotification: true }
    });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it('runs onSuccess and onSettled after a successful delete', async () => {
    mockAxios.delete.mockResolvedValue({ data: { id: 'series-1' } });
    const onSettled = vi.fn();
    const onSuccess = vi.fn();
    const { result } = renderDeleteMutation();

    result.current.mutate({ id: 'series-1' }, { onSettled, onSuccess });

    await waitFor(() => expect(onSettled).toHaveBeenCalledOnce());
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('notifies and skips onSuccess when the API refuses the delete', async () => {
    mockAxios.delete.mockRejectedValue(new Error('Series has collected data'));
    const onSettled = vi.fn();
    const onSuccess = vi.fn();
    const { result } = renderDeleteMutation();

    result.current.mutate({ id: 'series-1' }, { onSettled, onSuccess });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(onSettled).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({ message: 'Failed to delete instrument', type: 'error' });
  });
});
