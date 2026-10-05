import type { SessionType } from '@opendatacapture/schemas/session';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentHubRecords } from '../useInstrumentHubRecords';

import type { InstrumentVisualizationRecord } from '../useInstrumentVisualization';

type HubSearch = { methods?: SessionType[]; minDate?: Date; series?: string[] };

type VisualizationParams = {
  filterRecord: (record: InstrumentVisualizationRecord) => boolean;
  instrumentId: string | undefined;
  seriesInstrumentId: string | undefined;
};

const mocks: {
  isSeries: boolean;
  search: HubSearch;
  /** Captured so the params the hook hands down can be asserted without rendering the real hook */
  visualizationParams: undefined | VisualizationParams;
} = vi.hoisted(() => ({
  isSeries: false,
  search: {},
  visualizationParams: undefined
}));

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ instrumentId: 'instrument-1' }),
  useSearch: () => mocks.search
}));
vi.mock('@/hooks/useInstrumentHubFacets', () => ({
  NO_SERIES: '',
  useInstrumentHubFacets: () => ({ isSeries: mocks.isSeries })
}));
vi.mock('@/hooks/useInstrumentVisualization', () => ({
  useInstrumentVisualization: ({ params }: { params: VisualizationParams }) => {
    mocks.visualizationParams = params;
    return { records: [] };
  }
}));

const record = (overrides: Partial<InstrumentVisualizationRecord> = {}): InstrumentVisualizationRecord => ({
  __date__: new Date('2025-01-01'),
  __id__: 'record-1',
  __instrumentId__: 'instrument-1',
  __method__: 'IN_PERSON',
  __seriesId__: null,
  __seriesName__: null,
  __subjectId__: 'subject-1',
  __time__: 0,
  ...overrides
});

/** The predicate the hook hands down, which is what both tabs and the download are filtered by. */
const filterRecord = (): ((record: InstrumentVisualizationRecord) => boolean) => {
  renderHook(() => useInstrumentHubRecords());
  return mocks.visualizationParams!.filterRecord;
};

describe('useInstrumentHubRecords', () => {
  beforeEach(() => {
    mocks.isSeries = false;
    mocks.search = {};
    mocks.visualizationParams = undefined;
  });

  afterEach(cleanup);

  // The filter goes *into* the visualization hook rather than being applied to its result, because
  // its download closes over its own records — a filter applied outside would narrow the table
  // while the download kept every row the user believed they had excluded.
  it('should hand the predicate to the visualization hook rather than filtering its output', () => {
    renderHook(() => useInstrumentHubRecords());
    expect(typeof mocks.visualizationParams!.filterRecord).toBe('function');
  });

  it('should keep every record when no filter is set', () => {
    const matches = filterRecord();
    expect(matches(record())).toBe(true);
    expect(matches(record({ __method__: null }))).toBe(true);
  });

  it('should drop a record whose method is not selected', () => {
    mocks.search = { methods: ['REMOTE'] };
    expect(filterRecord()(record({ __method__: 'IN_PERSON' }))).toBe(false);
  });

  it('should keep a record whose method is selected', () => {
    mocks.search = { methods: ['IN_PERSON'] };
    expect(filterRecord()(record({ __method__: 'IN_PERSON' }))).toBe(true);
  });

  // A record whose session was deleted carries no method, so it matches no explicit selection.
  // Exempting it meant unchecking every method still left rows on screen.
  it('should drop a record with no method once the method filter narrows', () => {
    mocks.search = { methods: ['IN_PERSON'] };
    expect(filterRecord()(record({ __method__: null }))).toBe(false);
  });

  it('should show nothing when every method is unchecked, which an absent filter does not mean', () => {
    mocks.search = { methods: [] };
    const matches = filterRecord();
    expect(matches(record({ __method__: 'IN_PERSON' }))).toBe(false);
    expect(matches(record({ __method__: null }))).toBe(false);
  });

  it('should match a record collected outside any series against the no-series option', () => {
    mocks.search = { series: [''] };
    expect(filterRecord()(record({ __seriesId__: null }))).toBe(true);
  });

  it('should drop a record whose series is not selected', () => {
    mocks.search = { series: ['series-1'] };
    expect(filterRecord()(record({ __seriesId__: 'series-2' }))).toBe(false);
  });

  // A record never carries a series as its own `instrumentId`, so querying it that way for a series
  // page would always come back empty.
  it('should query a series through seriesInstrumentId, not instrumentId', () => {
    mocks.isSeries = true;
    renderHook(() => useInstrumentHubRecords());
    expect(mocks.visualizationParams!.instrumentId).toBeUndefined();
    expect(mocks.visualizationParams!.seriesInstrumentId).toBe('instrument-1');
  });

  it('should query a scalar instrument through instrumentId', () => {
    renderHook(() => useInstrumentHubRecords());
    expect(mocks.visualizationParams!.instrumentId).toBe('instrument-1');
    expect(mocks.visualizationParams!.seriesInstrumentId).toBeUndefined();
  });
});
