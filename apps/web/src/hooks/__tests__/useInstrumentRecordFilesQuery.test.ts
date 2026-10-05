import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { instrumentRecordFilesQueryOptions, useInstrumentRecordFilesQuery } from '../useInstrumentRecordFilesQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const FILES = {
  upload: [{ exp: 1700000000, name: 'scan.pdf', size: 100, url: 'https://example.org/scan.pdf' }]
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('instrumentRecordFilesQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: FILES });
  });

  it('should request the files of the given record', async () => {
    const files = await createQueryClient().fetchQuery(
      instrumentRecordFilesQueryOptions({ params: { id: 'record-1' } })
    );
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-records/record-1/files');
    expect(files).toEqual(FILES);
  });

  it('should reject a file without a presigned url', async () => {
    mockAxios.get.mockResolvedValue({ data: { upload: [{ exp: 1700000000, name: 'scan.pdf', size: 100 }] } });
    await expect(
      createQueryClient().fetchQuery(instrumentRecordFilesQueryOptions({ params: { id: 'record-1' } }))
    ).rejects.toThrow();
  });

  it('should key the cache under the record, so invalidating the record also refreshes its files', () => {
    expect(instrumentRecordFilesQueryOptions({ params: { id: 'record-1' } }).queryKey).toEqual([
      'instrument-records',
      'id-record-1',
      'files'
    ]);
  });
});

describe('useInstrumentRecordFilesQuery', () => {
  it('should resolve to the files once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: FILES });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useInstrumentRecordFilesQuery({ params: { id: 'record-1' } }), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(Object.keys(result.current.data)).toEqual(['upload']);
  });
});
