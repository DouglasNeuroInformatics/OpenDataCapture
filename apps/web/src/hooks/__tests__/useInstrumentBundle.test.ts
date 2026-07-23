import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentBundle } from '../useInstrumentBundle';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));
const store = vi.hoisted(() => ({ currentGroup: { id: 'group-1' } }));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

function renderBundleQuery(id: null | string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useInstrumentBundle(id), { wrapper }), queryClient };
}

describe('useInstrumentBundle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.currentGroup = { id: 'group-1' };
    mockAxios.get.mockResolvedValue({ data: { bundle: '__BUNDLE__', id: 'instrument-1', kind: 'FORM' } });
  });

  it('requests the bundle for the currently selected group', async () => {
    const { result } = renderBundleQuery('instrument-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instruments/bundle/instrument-1', {
      params: { groupId: 'group-1' }
    });
  });

  // A series resolves different constituent bundles depending on which group is asking, so the cache
  // entry has to be keyed by group as well as by instrument id.
  it('caches the bundle under a group-scoped key', async () => {
    const { queryClient, result } = renderBundleQuery('instrument-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['instrument-bundle', 'group-1', 'instrument-1'])).toEqual({
      bundle: '__BUNDLE__',
      id: 'instrument-1',
      kind: 'FORM'
    });
  });

  it('does not request anything until an instrument is selected', () => {
    renderBundleQuery(null);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
