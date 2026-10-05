import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentRecords } from '../useInstrumentRecords';

type GetConfig = { params: unknown; transformResponse: [(data: string) => unknown] };

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const RECORD = {
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  data: { causes: new Set(['FRIENDS', 'MONEY']) },
  date: new Date('2025-01-01T12:00:00.000Z'),
  id: 'record-1',
  instrumentId: 'instrument-1',
  sessionId: 'session-1',
  subjectId: 'subject-1',
  updatedAt: new Date('2025-01-01T00:00:00.000Z')
};

/** Answer as the server would: a serialized body that only the request's own transform can revive. */
function respondWithSerialized(body: unknown) {
  mockAxios.get.mockImplementation((_url: string, config: GetConfig) =>
    Promise.resolve({ data: config.transformResponse[0](JSON.stringify(body, replacer)) })
  );
}

function renderRecords(...args: Parameters<typeof useInstrumentRecords>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useInstrumentRecords(...args), { wrapper }), queryClient };
}

describe('useInstrumentRecords', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    respondWithSerialized([RECORD]);
  });

  it('should request every record when called without options', async () => {
    const { result } = renderRecords();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-records', expect.objectContaining({ params: {} }));
  });

  it('should revive serialized sets, so multi-select answers keep their type', async () => {
    const { result } = renderRecords();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0]!.data).toEqual({ causes: new Set(['FRIENDS', 'MONEY']) });
  });

  it('should key the cache on every parameter, so a different filter does not serve stale records', async () => {
    const { queryClient, result } = renderRecords({
      params: { instrumentId: 'instrument-1', subjectId: 'subject-1' }
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['instrument-records', 'instrument-1', 'subject-1'])).toHaveLength(1);
  });

  it('should not request anything while disabled', () => {
    renderRecords({ enabled: false, params: { instrumentId: 'instrument-1' } });
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should fail when the response is not an array of records', async () => {
    respondWithSerialized([{ id: 'record-1' }]);
    const { result } = renderRecords();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
