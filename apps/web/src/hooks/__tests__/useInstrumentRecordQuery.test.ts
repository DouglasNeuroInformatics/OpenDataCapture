import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { instrumentRecordQueryOptions, useInstrumentRecordQuery } from '../useInstrumentRecordQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const RECORD = {
  createdAt: '2025-01-01T00:00:00.000Z',
  data: { score: 3 },
  date: '2025-01-01T12:00:00.000Z',
  id: 'record-1',
  instrumentId: 'instrument-1',
  sessionId: 'session-1',
  subjectId: 'subject-1',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('instrumentRecordQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: RECORD });
  });

  it('should request the record by id and parse its date', async () => {
    const record = await createQueryClient().fetchQuery(instrumentRecordQueryOptions({ params: { id: 'record-1' } }));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-records/record-1');
    expect(record.date).toEqual(new Date(RECORD.date));
  });

  it('should reject a response that is not a record', async () => {
    mockAxios.get.mockResolvedValue({ data: { id: 'record-1' } });
    await expect(
      createQueryClient().fetchQuery(instrumentRecordQueryOptions({ params: { id: 'record-1' } }))
    ).rejects.toThrow();
  });

  it('should key the cache under instrument-records, so invalidating the records also refreshes this one', () => {
    expect(instrumentRecordQueryOptions({ params: { id: 'record-1' } }).queryKey).toEqual([
      'instrument-records',
      'id-record-1'
    ]);
  });
});

describe('useInstrumentRecordQuery', () => {
  it('should resolve to the record once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: RECORD });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useInstrumentRecordQuery({ params: { id: 'record-1' } }), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.id).toBe('record-1');
  });
});
