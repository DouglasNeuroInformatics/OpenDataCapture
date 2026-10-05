import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { Json } from '@opendatacapture/runtime-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUploadInstrumentRecordsMutation } from '../useUploadInstrumentRecordsMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const date = new Date('2026-02-01T00:00:00.000Z');

// The CSV upload page hands over parsed dates the `Json` type does not admit, which is why the hook
// serializes record data at all; the cast reproduces what that page sends.
const dataWithDate = { completedAt: date, score: 3 } as unknown as Json;

function renderUploadMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useUploadInstrumentRecordsMutation(), { wrapper });
}

describe('useUploadInstrumentRecordsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should upload without the default timeout, since a large batch can outlast it', async () => {
    const { result } = renderUploadMutation();
    await result.current.mutateAsync({ instrumentId: 'instrument-1', records: [] });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/instrument-records/upload',
      { instrumentId: 'instrument-1', records: [] },
      { meta: { disableDefaultTimeout: true } }
    );
  });

  it('should tag dates inside record data, so the server can revive them rather than store bare strings', async () => {
    const { result } = renderUploadMutation();
    await result.current.mutateAsync({
      groupId: 'group-1',
      instrumentId: 'instrument-1',
      records: [{ data: dataWithDate, date, subjectId: 'subject-1' }]
    });
    expect(mockAxios.post.mock.lastCall?.[1]).toMatchObject({
      groupId: 'group-1',
      records: [
        {
          data: {
            completedAt: { __deserializedType: 'Date', __isSerializedType: true, value: date.toISOString() },
            score: 3
          },
          date,
          subjectId: 'subject-1'
        }
      ]
    });
  });

  it('should announce success once the records are uploaded', async () => {
    const { result } = renderUploadMutation();
    await result.current.mutateAsync({ instrumentId: 'instrument-1', records: [] });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });
});
