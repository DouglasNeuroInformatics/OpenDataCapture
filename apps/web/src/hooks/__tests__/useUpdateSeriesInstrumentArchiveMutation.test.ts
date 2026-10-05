import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateSeriesInstrumentArchiveMutation } from '../useUpdateSeriesInstrumentArchiveMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    resolvedLanguage: 'en',
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

// The app default is `throwOnError: true`; mirroring it is what makes the refusal case meaningful,
// since without the hook's override the rejection would escape to the route error boundary.
function renderArchiveMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUpdateSeriesInstrumentArchiveMutation(), { wrapper }), invalidateQueries };
}

describe('useUpdateSeriesInstrumentArchiveMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should send only the archive flag to the series, without the default error toast', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'series-1', isArchived: true });
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/instruments/series/series-1',
      { isArchived: true },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });

  it('should announce success and refresh the overview and every instrument picker', async () => {
    const { invalidateQueries, result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'series-1', isArchived: true });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['series-instruments-overview'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it('should report a refusal on the page rather than escaping to the route error boundary', async () => {
    mockAxios.isAxiosError.mockReturnValueOnce(true);
    mockAxios.patch.mockRejectedValueOnce({ response: { data: { message: 'Series is in use' } } });
    const { result } = renderArchiveMutation();
    result.current.mutate({ id: 'series-1', isArchived: true });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenCalledWith({ message: 'Series is in use', type: 'error' });
  });

  it('should fall back to a generic failure message when the server gives no reason', async () => {
    mockAxios.patch.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderArchiveMutation();
    result.current.mutate({ id: 'series-1', isArchived: false });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).toHaveBeenCalledWith({
      message: 'Failed to update the series instrument',
      type: 'error'
    });
  });
});
