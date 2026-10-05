import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLinearModelQuery } from '../useLinearModelQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const RESULTS = { score: { intercept: 1, slope: 0.5, stdErr: 0.1 } };

function renderLinearModel(...args: Parameters<typeof useLinearModelQuery>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useLinearModelQuery(...args), { wrapper }), queryClient };
}

describe('useLinearModelQuery', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: RESULTS });
  });

  it('should request the model for the given group and instrument', async () => {
    const { result } = renderLinearModel({ params: { groupId: 'group-1', instrumentId: 'instrument-1' } });
    await waitFor(() => expect(result.current.data).toEqual(RESULTS));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/instrument-records/linear-model', {
      params: { groupId: 'group-1', instrumentId: 'instrument-1' }
    });
  });

  it('should key the cache on group and instrument, so switching either fits a new model', async () => {
    const { queryClient, result } = renderLinearModel({
      params: { groupId: 'group-1', instrumentId: 'instrument-1' }
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['linear-model', 'group-1', 'instrument-1'])).toEqual(RESULTS);
  });

  it('should not request a model while disabled', () => {
    renderLinearModel({ enabled: false, params: { instrumentId: 'instrument-1' } });
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should fail when a coefficient is missing from the response', async () => {
    mockAxios.get.mockResolvedValue({ data: { score: { intercept: 1, slope: 0.5 } } });
    const { result } = renderLinearModel({ params: { instrumentId: 'instrument-1' } });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
