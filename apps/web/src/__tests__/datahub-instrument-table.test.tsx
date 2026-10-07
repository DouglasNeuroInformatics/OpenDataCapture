import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentRow } from '@/components/InstrumentTable';
import { Route } from '@/routes/_app/datahub/instruments/$instrumentId/table';

import '@/services/i18n';

type VisualizationRecord = {
  [key: string]: unknown;
  __date__: unknown;
  __id__: string;
  __instrumentId__: string;
  __method__: null | string;
  __seriesId__: null | string;
  __seriesName__: null | string;
  __subjectId__: string;
  __time__: number;
};

const mocks = vi.hoisted(() => ({
  facets: {
    editionOptions: {},
    isSeries: false,
    seriesOptions: new Map<string, null | string>(),
    title: 'Happiness Questionnaire'
  },
  infoById: {},
  openSeriesMember: { current: null as ((row: InstrumentRow) => void) | null },
  records: [] as VisualizationRecord[]
}));

vi.mock('@/hooks/useInstrumentHubRecords', () => ({
  useInstrumentHubRecords: () => ({ dl: vi.fn(), records: mocks.records })
}));
vi.mock('@/hooks/useInstrumentHubFacets', () => ({
  NO_SERIES: '',
  useInstrumentHubFacets: () => mocks.facets
}));
vi.mock('@/hooks/useInstrumentInfoById', () => ({ useInstrumentInfoById: () => mocks.infoById }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentGroup: null }) => unknown) => selector({ currentGroup: null })
}));
// Captured rather than rendered: the listing itself is covered by instrument-table.test.tsx, and
// what matters here is the search the drill-down navigates with.
vi.mock('@/components/InstrumentTable', () => ({
  InstrumentTable: ({ onOpen }: { onOpen: (row: InstrumentRow) => void }) => {
    mocks.openSeriesMember.current = onOpen;
    return <span data-testid="instrument-hub-series-members" />;
  }
}));
vi.mock('@/components/SelectEdition', () => ({ SelectEdition: () => <span /> }));
vi.mock('@/components/TimeDropdown', () => ({ TimeDropdown: () => <span /> }));

const navigate = vi.fn();

const record = (overrides: Partial<VisualizationRecord> = {}): VisualizationRecord => ({
  __date__: new Date('2026-01-15'),
  __id__: 'record-1',
  __instrumentId__: 'hq-1',
  __method__: 'IN_PERSON',
  __seriesId__: null,
  __seriesName__: null,
  __subjectId__: 'ROOT$alice',
  __time__: 0,
  totalScore: 7,
  ...overrides
});

const renderTable = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

const headers = () =>
  Array.from(screen.getByTestId('data-table-head').firstElementChild!.children, (header) => header.textContent).filter(
    Boolean
  );

/** The sort control a header carries, or undefined when the header is plain text. */
const headerButton = (label: string) =>
  Array.from(screen.getByTestId('data-table-head').querySelectorAll('button')).find(
    (button) => button.textContent === label
  );

beforeEach(() => {
  navigate.mockReset();
  mocks.facets.isSeries = false;
  mocks.facets.seriesOptions = new Map();
  mocks.infoById = {};
  mocks.openSeriesMember.current = null;
  mocks.records = [record()];
  vi.spyOn(Route, 'useNavigate').mockReturnValue(navigate);
  vi.spyOn(Route, 'useParams').mockReturnValue({ instrumentId: 'hq-1' });
  vi.spyOn(Route, 'useSearch').mockReturnValue({});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('instrument hub table route', () => {
  it('should name every column after the field the export uses', () => {
    renderTable();
    expect(headers()).toEqual(['SUBJECT', 'DATE_COLLECTED', 'COLLECTION_METHOD', 'SERIES', 'TOTAL_SCORE']);
  });

  // The hub's instrument listing sorts from its headers, so this table reading as fixed text made
  // the two look like different kinds of table.
  it.each(['SUBJECT', 'DATE_COLLECTED', 'COLLECTION_METHOD', 'SERIES', 'TOTAL_SCORE'])(
    'should offer a sort control on the %s header',
    (label) => {
      renderTable();
      expect(headerButton(label)).toBeTruthy();
    }
  );

  it('should reorder the rows when a header control is used', () => {
    mocks.records = [record({ __id__: 'r-1', totalScore: 2 }), record({ __id__: 'r-2', totalScore: 9 })];
    renderTable();
    const scores = () => screen.queryAllByTestId('instrument-table-cell-totalScore').map((cell) => cell.textContent);
    expect(scores()).toEqual(['2', '9']);
    fireEvent.click(headerButton('TOTAL_SCORE')!);
    expect(scores()).toEqual(['9', '2']);
  });
});

describe('instrument hub series members', () => {
  beforeEach(() => {
    mocks.facets.isSeries = true;
    mocks.infoById = { 'member-1': { edition: 2, kind: 'FORM', title: 'Member One' } };
    mocks.records = [record({ __instrumentId__: 'member-1', __seriesId__: 'hq-1', __seriesName__: 'Repeated' })];
  });

  // Opening a member from a series means "the subjects this series collected", not every record the
  // member instrument ever took — so the drill-down carries the series as a filter, not just as the
  // breadcrumb the return link reads.
  it('should narrow a member instrument to the series it was opened from', () => {
    renderTable();
    mocks.openSeriesMember.current!({ id: 'member-1' } as InstrumentRow);
    expect(navigate).toHaveBeenCalledWith({
      params: { instrumentId: 'member-1' },
      search: { fromSeries: 'hq-1', series: ['hq-1'] },
      to: '/datahub/instruments/$instrumentId/table'
    });
  });
});
