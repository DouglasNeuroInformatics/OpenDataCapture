import type { InstrumentRecordSummary } from '@opendatacapture/schemas/instrument-records';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentRow } from '@/components/InstrumentTable';
import { Route } from '@/routes/_app/datahub/instruments/index';

import '@/services/i18n';

type InstrumentInfo = {
  details: { title: string };
  id: string;
  internal?: { edition: number; name: string };
  kind: string;
  sourceRepo?: null | { name: string };
};

const mocks = vi.hoisted(() => ({
  infos: undefined as InstrumentInfo[] | undefined,
  instrumentRecordSummaryQueryOptions: vi.fn((options: object) => ({
    options,
    queryKey: ['instrument-record-summary']
  })),
  navigate: vi.fn(),
  seriesSummaries: [] as InstrumentRecordSummary[],
  store: { currentGroup: null as null | { id: string } },
  summaries: [] as InstrumentRecordSummary[]
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({ useInstrumentInfoQuery: () => ({ data: mocks.infos }) }));
vi.mock('@/hooks/useInstrumentRecordSummaryQuery', () => ({
  instrumentRecordSummaryQueryOptions: mocks.instrumentRecordSummaryQueryOptions,
  useInstrumentRecordSummaryQuery: ({ params }: { params?: { bySeries?: boolean } } = {}) => ({
    data: params?.bySeries ? mocks.seriesSummaries : mocks.summaries
  })
}));
vi.mock('@/store', () => ({
  useAppStore: Object.assign((selector: (store: typeof mocks.store) => unknown) => selector(mocks.store), {
    getState: () => mocks.store
  })
}));

/** The listing itself has its own test; this one is about the rows the route builds for it. */
vi.mock('@/components/InstrumentTable', () => ({
  InstrumentTable: ({ onOpen, rows }: { onOpen: (row: InstrumentRow) => void; rows: InstrumentRow[] }) => (
    <ul>
      {rows.map((row) => (
        <li key={row.id}>
          <button data-testid={`row-${row.id}`} type="button" onClick={() => onOpen(row)}>
            {JSON.stringify(row)}
          </button>
        </li>
      ))}
    </ul>
  )
}));

const summaryOf = (
  instrumentId: string,
  overrides: Partial<InstrumentRecordSummary> = {}
): InstrumentRecordSummary => ({
  instrumentId,
  lastCollectedAt: new Date('2026-01-01'),
  recordCount: 3,
  subjectCount: 2,
  ...overrides
});

const scalar = (id: string, overrides: Partial<InstrumentInfo> = {}): InstrumentInfo => ({
  details: { title: 'Happiness Questionnaire' },
  id,
  internal: { edition: 1, name: 'HQ' },
  kind: 'FORM',
  ...overrides
});

const renderHub = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

const rowFor = (id: string) => JSON.parse(screen.getByTestId(`row-${id}`).textContent) as InstrumentRow;

describe('Route', () => {
  beforeEach(() => {
    mocks.infos = [scalar('hq-1')];
    mocks.navigate.mockReset();
    mocks.seriesSummaries = [];
    mocks.store.currentGroup = null;
    mocks.summaries = [summaryOf('hq-1')];
    mocks.instrumentRecordSummaryQueryOptions.mockClear();
  });

  afterEach(cleanup);

  it('should list an instrument with the counts collected under it', () => {
    renderHub();
    expect(rowFor('hq-1')).toMatchObject({ edition: 1, kind: 'FORM', recordCount: 3, subjectCount: 2 });
  });

  // A series holds no records under its own id, so counting the per-instrument summary would list
  // every series as empty.
  it('should count a series from what it orchestrated rather than from its own records', () => {
    mocks.infos = [{ details: { title: 'Happiness Series' }, id: 'series-1', kind: 'SERIES' }];
    mocks.seriesSummaries = [summaryOf('series-1', { recordCount: 9, subjectCount: 4 })];
    renderHub();
    expect(rowFor('series-1')).toMatchObject({ edition: null, kind: 'SERIES', recordCount: 9, subjectCount: 4 });
  });

  // An instrument the caller may read but has never collected still belongs in the listing.
  it('should list an instrument with no records as empty rather than omitting it', () => {
    mocks.summaries = [];
    renderHub();
    expect(rowFor('hq-1')).toMatchObject({ lastCollectedAt: null, recordCount: 0, subjectCount: 0 });
  });

  it('should name the repository an imported instrument came from', () => {
    mocks.infos = [scalar('hq-1', { sourceRepo: { name: 'odc-instruments' } })];
    renderHub();
    expect(rowFor('hq-1').source).toBe('odc-instruments');
  });

  it('should leave the source empty for an instrument that came from no repository', () => {
    renderHub();
    expect(rowFor('hq-1').source).toBeNull();
  });

  it('should list nothing while the catalog is still loading', () => {
    mocks.infos = undefined;
    renderHub();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('should open the record table of the instrument that was clicked', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('row-hq-1'));
    expect(mocks.navigate).toHaveBeenCalledWith({
      params: { instrumentId: 'hq-1' },
      to: '/datahub/instruments/$instrumentId/table'
    });
  });

  it('should prefetch both summaries, so the listing never renders a row without its counts', async () => {
    mocks.store.currentGroup = { id: 'group-1' };
    const loader = Route.options.loader as (opts: {
      context: { queryClient: { ensureQueryData: (options: unknown) => Promise<unknown> } };
    }) => Promise<void>;
    const ensureQueryData = vi.fn().mockResolvedValue([]);

    await loader({ context: { queryClient: { ensureQueryData } } });

    expect(mocks.instrumentRecordSummaryQueryOptions).toHaveBeenCalledWith({ params: { groupId: 'group-1' } });
    expect(mocks.instrumentRecordSummaryQueryOptions).toHaveBeenCalledWith({
      params: { bySeries: true, groupId: 'group-1' }
    });
    expect(ensureQueryData).toHaveBeenCalledTimes(2);
  });
});
