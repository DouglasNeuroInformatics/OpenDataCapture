import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { bilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { omit } from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentInfoQuery } from '../useInstrumentInfoQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));
const store = vi.hoisted(() => {
  const state: { currentGroup: null | { id: string } } = { currentGroup: { id: 'group-1' } };
  return state;
});
const translation = vi.hoisted(() => {
  const state: { resolvedLanguage: 'en' | 'fr' | undefined } = { resolvedLanguage: 'en' };
  return state;
});

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useTranslation: vi.fn(() => translation)
}));

const BILINGUAL_INFO = {
  ...omit(bilingualFormInstrument.instance, ['content', 'measures', 'validationSchema']),
  id: 'form-1'
};

function renderInfoQuery(...args: Parameters<typeof useInstrumentInfoQuery>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useInstrumentInfoQuery(...args), { wrapper }), queryClient };
}

describe('useInstrumentInfoQuery', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    store.currentGroup = { id: 'group-1' };
    translation.resolvedLanguage = 'en';
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

  it('should request the info without a group when none is selected', async () => {
    store.currentGroup = null;
    const { result } = renderInfoQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instruments/info', { params: { groupId: undefined } });
  });

  it('should forward the filters alongside the group', async () => {
    const { result } = renderInfoQuery({ params: { allEditions: true, kind: 'FORM', subjectId: 'subject-1' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instruments/info', {
      params: { allEditions: true, groupId: 'group-1', kind: 'FORM', subjectId: 'subject-1' }
    });
  });

  it('should key the cache on every filter and the language, so neither serves a stale list', async () => {
    translation.resolvedLanguage = 'fr';
    const { queryClient, result } = renderInfoQuery({
      params: { allEditions: true, kind: 'FORM', subjectId: 'subject-1' }
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['instrument-info', 'group-1', 'FORM', 'subject-1', true, 'fr'])).toEqual([]);
  });

  it('should translate each instrument into the interface language', async () => {
    translation.resolvedLanguage = 'fr';
    mockAxios.get.mockResolvedValue({ data: [BILINGUAL_INFO] });
    const { result } = renderInfoQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((info) => info.details.title)).toEqual(['Formulaire bilingue']);
  });

  it('should translate into English before the interface language has resolved', async () => {
    translation.resolvedLanguage = undefined;
    mockAxios.get.mockResolvedValue({ data: [BILINGUAL_INFO] });
    const { result } = renderInfoQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((info) => info.details.title)).toEqual(['Bilingual Form']);
  });
});
