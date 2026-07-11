import type { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteInstrumentMutation } from '../useDeleteInstrumentMutation';
import { useInstrumentBundle } from '../useInstrumentBundle';
import { useInstrumentInfoQuery } from '../useInstrumentInfoQuery';

const mockAxios = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  isAxiosError: vi.fn(() => false)
}));
const addNotification = vi.hoisted(() => vi.fn());
const store = vi.hoisted(() => ({ currentGroup: { id: 'group-1' } }));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    resolvedLanguage: 'en',
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

function createWrapper(queryClient: QueryClient) {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('group-scoped instrument hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.currentGroup = { id: 'group-1' };
  });

  it('refetches instrument info with the newly selected group', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender, result } = renderHook(() => useInstrumentInfoQuery(), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenLastCalledWith('/v1/instruments/info', {
      params: { groupId: 'group-1' }
    });

    store.currentGroup = { id: 'group-2' };
    rerender();

    await waitFor(() => expect(mockAxios.get).toHaveBeenCalledTimes(2));
    expect(mockAxios.get).toHaveBeenLastCalledWith('/v1/instruments/info', {
      params: { groupId: 'group-2' }
    });
  });

  it('scopes bundle requests and cache entries to the selected group', async () => {
    mockAxios.get.mockResolvedValue({
      data: { bundle: '__BUNDLE__', id: 'instrument-1', kind: 'FORM' }
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useInstrumentBundle('instrument-1'), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instruments/bundle/instrument-1', {
      params: { groupId: 'group-1' }
    });
    expect(queryClient.getQueryData(['instrument-bundle', 'group-1', 'instrument-1'])).toEqual({
      bundle: '__BUNDLE__',
      id: 'instrument-1',
      kind: 'FORM'
    });
  });

  it('handles a rejected delete without rethrowing it into the route boundary', async () => {
    const error = new Error('Series has collected data');
    mockAxios.delete.mockRejectedValue(error);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { throwOnError: true } }
    });
    const { result } = renderHook(() => useDeleteInstrumentMutation(), {
      wrapper: createWrapper(queryClient)
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 'series-1' })).rejects.toBe(error);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addNotification).toHaveBeenCalledWith({
      message: 'Failed to delete instrument',
      type: 'error'
    });
  });
});
