import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  seriesInstrumentsOverviewQueryOptions,
  useSeriesInstrumentsOverviewQuery
} from '../useSeriesInstrumentsOverviewQuery';

vi.mock('axios');

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

const series = {
  __runtimeVersion: 1,
  archivedAt: '2024-06-01T00:00:00.000Z',
  createdAt: '2024-03-01T00:00:00.000Z',
  details: { description: 'A series', license: 'UNLICENSED', title: 'Intake' },
  id: 'series-1',
  kind: 'SERIES',
  language: 'en',
  seriesGroup: { id: 'group-1', name: 'Depression Clinic' },
  seriesGroupId: 'group-1',
  seriesItems: [],
  tags: ['Series']
};

describe('seriesInstrumentsOverviewQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should read the overview of every series from the administrators endpoint', async () => {
    get.mockResolvedValueOnce({ data: [] });
    await new QueryClient().fetchQuery(seriesInstrumentsOverviewQueryOptions());
    expect(get).toHaveBeenCalledWith('/v1/instruments/series');
  });

  it('should parse the archive date into a date, so the page can tell archived series from active ones', async () => {
    get.mockResolvedValueOnce({ data: [series] });
    const [result] = await new QueryClient().fetchQuery(seriesInstrumentsOverviewQueryOptions());
    expect(result).toMatchObject({
      archivedAt: new Date('2024-06-01T00:00:00.000Z'),
      seriesGroup: { name: 'Depression Clinic' }
    });
  });

  it('should suspend until the overview loads, then hand the parsed series to the page', async () => {
    get.mockResolvedValueOnce({ data: [series] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useSeriesInstrumentsOverviewQuery(), { wrapper });
    await waitFor(() => expect(result.current?.data).toHaveLength(1));
    expect(result.current.data[0]?.id).toBe('series-1');
  });
});
