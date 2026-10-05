import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NO_SERIES, useInstrumentHubFacets } from '../useInstrumentHubFacets';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  infos: [] as { details: { title: string }; id: string; internal?: { edition: number; name: string }; kind: string }[],
  instrumentId: 'hq-1',
  records: [] as { seriesInstrumentId?: null | string }[],
  seriesInfoById: {}
}));

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ instrumentId: mocks.instrumentId })
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.infos })
}));
vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: () => ({ data: mocks.records })
}));
vi.mock('@/hooks/useInstrumentInfoById', () => ({
  useInstrumentInfoById: () => mocks.seriesInfoById
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentGroup: null }) => unknown) => selector({ currentGroup: null })
}));

const scalar = (id: string, name: string, edition: number) => ({
  details: { title: name },
  id,
  internal: { edition, name },
  kind: 'FORM'
});

describe('useInstrumentHubFacets', () => {
  beforeEach(() => {
    mocks.infos = [scalar('hq-1', 'Happiness Questionnaire', 1)];
    mocks.instrumentId = 'hq-1';
    mocks.records = [];
    mocks.seriesInfoById = {};
  });

  afterEach(cleanup);

  it('should name the opened instrument from the catalog', () => {
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.title).toBe('Happiness Questionnaire');
  });

  it('should report no title for an instrument the catalog does not hold', () => {
    mocks.instrumentId = 'missing';
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.title).toBeNull();
  });

  // The series page is a different shape — no shared measures, so no measure columns and no chart.
  it('should flag a series, so its page can suppress the chart', () => {
    mocks.infos = [{ details: { title: 'Happiness Series' }, id: 'series-1', kind: 'SERIES' }];
    mocks.instrumentId = 'series-1';
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.isSeries).toBe(true);
  });

  it('should not flag a scalar instrument as a series', () => {
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.isSeries).toBe(false);
  });

  it('should offer every sibling edition of the opened instrument', () => {
    mocks.infos = [scalar('hq-1', 'Happiness Questionnaire', 1), scalar('hq-2', 'Happiness Questionnaire', 2)];
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.editionOptions).toStrictEqual({ 'hq-1': 'Edition 1', 'hq-2': 'Edition 2' });
  });

  // The filter can only offer what the records actually reference, so a series nothing was
  // collected under is not an option.
  it('should offer only the series its records were collected under', () => {
    mocks.records = [{ seriesInstrumentId: 'series-1' }];
    mocks.seriesInfoById = { 'series-1': { kind: 'SERIES', title: 'Happiness Series' } };
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(Array.from(result.current.seriesOptions)).toStrictEqual([['series-1', 'Happiness Series']]);
  });

  it('should bucket records collected outside any series under the no-series option', () => {
    mocks.records = [{ seriesInstrumentId: null }];
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(Array.from(result.current.seriesOptions)).toStrictEqual([[NO_SERIES, null]]);
  });

  // A record may name a series the caller cannot read, leaving the id as the only available label.
  it('should offer a series it cannot name with no title rather than omitting it', () => {
    mocks.records = [{ seriesInstrumentId: 'series-unreadable' }];
    const { result } = renderHook(() => useInstrumentHubFacets());
    expect(result.current.seriesOptions.get('series-unreadable')).toBeNull();
  });
});
