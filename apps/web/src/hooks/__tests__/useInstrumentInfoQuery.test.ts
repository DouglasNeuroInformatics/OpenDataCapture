import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentInfoQuery } from '../useInstrumentInfoQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));
const store = vi.hoisted(() => ({ currentGroup: { id: 'group-1' } }));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useTranslation: vi.fn(() => ({ resolvedLanguage: 'en' }))
}));

function renderInfoQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useInstrumentInfoQuery(), { wrapper });
}

describe('useInstrumentInfoQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.currentGroup = { id: 'group-1' };
    mockAxios.get.mockResolvedValue({ data: [] });
  });

  it('requests the info for the currently selected group', async () => {
    const { result } = renderInfoQuery();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instruments/info', { params: { groupId: 'group-1' } });
  });

  // The group id is part of the query key, not just the request, so switching group cannot serve the
  // previous group's instruments from cache while the new request is in flight.
  it('refetches when the selected group changes', async () => {
    const { rerender, result } = renderInfoQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    store.currentGroup = { id: 'group-2' };
    rerender();

    await waitFor(() => expect(mockAxios.get).toHaveBeenCalledTimes(2));
    expect(mockAxios.get).toHaveBeenLastCalledWith('/v1/instruments/info', { params: { groupId: 'group-2' } });
  });
});
