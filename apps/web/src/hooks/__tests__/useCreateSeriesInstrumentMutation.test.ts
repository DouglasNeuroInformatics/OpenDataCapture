import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateSeriesInstrumentMutation } from '../useCreateSeriesInstrumentMutation';

const mockAxios = vi.hoisted(() => ({
  isAxiosError: vi.fn((error: unknown) => typeof error === 'object' && error !== null && 'response' in error),
  post: vi.fn()
}));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

const DATA: $CreateSeriesInstrumentData = {
  details: { title: 'Morning Battery' },
  groupId: 'group-1',
  items: [
    { edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' },
    { edition: 1, name: 'BREAKFAST_CHECKLIST' }
  ],
  language: 'en'
};

function renderCreateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useCreateSeriesInstrumentMutation(), { wrapper }), invalidateQueries };
}

describe('useCreateSeriesInstrumentMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: { instrumentId: 'series-1', outcome: 'created' } });
  });

  it('should post the series and suppress the default error toast, since the hook reports failures itself', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync(DATA);
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/instruments/series', DATA, {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should resolve to the created series, so the caller can select it', async () => {
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync(DATA)).resolves.toEqual({ instrumentId: 'series-1', outcome: 'created' });
  });

  it('should announce the new series once it is created', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync(DATA);
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the instrument list, so the new series can be selected', async () => {
    const { invalidateQueries, result } = renderCreateMutation();
    await result.current.mutateAsync(DATA);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it('should stay silent on a duplicate prompt, which has not created anything yet', async () => {
    mockAxios.post.mockResolvedValue({ data: { existingTitle: 'Morning Battery', outcome: 'duplicate' } });
    const { invalidateQueries, result } = renderCreateMutation();
    await expect(result.current.mutateAsync(DATA)).resolves.toEqual({
      existingTitle: 'Morning Battery',
      outcome: 'duplicate'
    });
    expect(addNotification).not.toHaveBeenCalled();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("should show the server's reason when the series is refused", async () => {
    const serverError = { response: { data: { message: 'Instrument not found' } } };
    mockAxios.post.mockRejectedValue(serverError);
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync(DATA)).rejects.toBe(serverError);
    expect(addNotification).toHaveBeenCalledWith({ message: 'Instrument not found', type: 'error' });
  });

  it('should fall back to a generic message when the failure carries no reason', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network Error'));
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync(DATA)).rejects.toThrow('Network Error');
    expect(addNotification).toHaveBeenCalledWith({ message: 'Failed to create series instrument', type: 'error' });
  });
});
