import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { summaryQueryOptions, useSummaryQuery } from '../useSummaryQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const summary = {
  counts: { instruments: 3, records: 10, sessions: 4, subjects: 2, users: 1 },
  trends: { records: [{ timestamp: 0, value: 10 }], sessions: [], subjects: [] }
};

function renderSummaryQuery(...args: Parameters<typeof useSummaryQuery>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useSummaryQuery(...args), { wrapper });
}

describe('useSummaryQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: summary });
  });

  it('should request the summary of the selected group', async () => {
    const { result } = renderSummaryQuery({ params: { groupId: 'group-1' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/summary', { params: { groupId: 'group-1' } });
    expect(result.current.data?.counts.records).toBe(10);
  });

  it('should request the instance-wide summary when called without a group', async () => {
    const { result } = renderSummaryQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/summary', { params: undefined });
  });

  it('should reject a summary with a negative count, so a corrupt total never reaches the dashboard', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { ...summary, counts: { ...summary.counts, users: -1 } } });
    await expect(new QueryClient().fetchQuery(summaryQueryOptions())).rejects.toThrow();
  });

  it('should keep the previous summary while another group loads, so the dashboard does not flash empty', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { children, client: queryClient });
    const { rerender, result } = renderHook(({ groupId }) => useSummaryQuery({ params: { groupId } }), {
      initialProps: { groupId: 'group-1' },
      wrapper
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    mockAxios.get.mockReturnValueOnce(new Promise(() => undefined));
    rerender({ groupId: 'group-2' });
    expect(result.current).toMatchObject({ data: { counts: { records: 10 } }, isPlaceholderData: true });
  });
});
