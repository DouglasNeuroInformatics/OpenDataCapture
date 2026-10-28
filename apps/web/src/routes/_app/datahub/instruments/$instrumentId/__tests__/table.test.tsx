import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
  records: [] as VisualizationRecord[],
  subjectIdDisplayLength: undefined as number | undefined
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
  useAppStore: (selector: (store: { currentGroup: { settings: { subjectIdDisplayLength?: number } } }) => unknown) => {
    return selector({ currentGroup: { settings: { subjectIdDisplayLength: mocks.subjectIdDisplayLength } } });
  }
}));
// Captured rather than rendered: the listing itself is covered by instrument-table.test.tsx, and
// what matters here is the search the drill-down navigates with.
vi.mock('@/components/InstrumentTable', () => ({
  InstrumentTable: ({
    minRecords,
    onMinRecordsChange,
    onOpen
  }: {
    minRecords?: number;
    onMinRecordsChange?: (value: number) => void;
    onOpen: (row: InstrumentRow) => void;
  }) => {
    mocks.openSeriesMember.current = onOpen;
    return (
      <span data-testid="instrument-hub-series-members">
        <span data-testid="series-min-records">{minRecords ?? 0}</span>
        <button data-testid="change-min-records" type="button" onClick={() => onMinRecordsChange?.(5)} />
      </span>
    );
  }
}));
vi.mock('@/components/SelectEdition', () => ({
  SelectEdition: ({ onSelect, value }: { onSelect: (id: string) => void; value: null | string }) => (
    <button data-testid="select-edition" data-value={value} type="button" onClick={() => onSelect('hq-2')} />
  )
}));
vi.mock('@/components/TimeDropdown', () => ({
  TimeDropdown: ({ onSelect, value }: { onSelect: (key: string) => void; value?: string }) => (
    <span data-testid="time-dropdown" data-value={value}>
      <button data-testid="select-time" type="button" onClick={() => onSelect('pastYear')} />
      <button data-testid="clear-time" type="button" onClick={() => onSelect('all')} />
    </span>
  )
}));

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

const headers = () => {
  return Array.from(
    screen.getByTestId('data-table-head').firstElementChild!.children,
    (header) => header.textContent
  ).filter(Boolean);
};

/** The sort control a header carries, or undefined when the header is plain text. */
const headerButton = (label: string) => {
  return Array.from(screen.getByTestId('data-table-head').querySelectorAll('button')).find(
    (button) => button.textContent === label
  );
};

const lastSearch = () => {
  const [{ search }] = navigate.mock.lastCall as [{ search: (prev: object) => object }];
  return search({});
};

describe('Route', () => {
  beforeEach(() => {
    navigate.mockReset();
    mocks.facets.isSeries = false;
    mocks.facets.seriesOptions = new Map();
    mocks.infoById = {};
    mocks.openSeriesMember.current = null;
    mocks.records = [record()];
    mocks.subjectIdDisplayLength = undefined;
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

    it('should derive measure columns from every record, not just the first', () => {
      mocks.records = [
        record({ __id__: 'r-1', totalScore: 7 }),
        record({ __id__: 'r-2', mood: 'good', totalScore: 5 })
      ];
      renderTable();
      expect(headers()).toEqual(['SUBJECT', 'DATE_COLLECTED', 'COLLECTION_METHOD', 'SERIES', 'TOTAL_SCORE', 'MOOD']);
    });

    it('should reorder the rows when a header control is used', () => {
      mocks.records = [record({ __id__: 'r-1', totalScore: 2 }), record({ __id__: 'r-2', totalScore: 9 })];
      renderTable();
      const scores = () => screen.queryAllByTestId('instrument-table-cell-totalScore').map((cell) => cell.textContent);
      expect(scores()).toEqual(['2', '9']);
      fireEvent.click(headerButton('TOTAL_SCORE')!);
      expect(scores()).toEqual(['9', '2']);
    });

    it('should show the collection date as an ISO date', () => {
      renderTable();
      expect(screen.getByText('2026-01-15')).toBeTruthy();
    });

    // A record whose date never parsed is shown as it stands rather than crashing the table.
    it('should show a date that is not a date as it stands', () => {
      mocks.records = [record({ __date__: 'not a date' })];
      renderTable();
      expect(screen.getByText('not a date')).toBeTruthy();
    });

    it("should truncate the subject id to the current group's display length", () => {
      mocks.subjectIdDisplayLength = 3;
      renderTable();
      expect(screen.getByText('ali')).toBeTruthy();
    });

    it('should truncate the subject id to nine characters when the group sets no display length', () => {
      mocks.records = [record({ __subjectId__: 'ROOT$abcdefghijkl' })];
      renderTable();
      expect(screen.getByText('abcdefghi')).toBeTruthy();
    });

    it('should open the record of the row that was double clicked', () => {
      renderTable();
      fireEvent.doubleClick(screen.getByTestId('data-table-row'));
      expect(navigate).toHaveBeenCalledWith({
        params: { recordId: 'record-1', subjectId: 'ROOT$alice' },
        search: { fromInstrument: 'hq-1', fromSeries: undefined },
        to: '/datahub/subjects/$subjectId/table/$recordId'
      });
    });

    it('should mark the row that was clicked as the highlighted one', () => {
      renderTable();
      expect(screen.getByTestId('data-table-row').querySelector('[data-row-selected="false"]')).toBeTruthy();
      fireEvent.click(screen.getByTestId('data-table-row'));
      expect(screen.getByTestId('data-table-row').querySelector('[data-row-selected="true"]')).toBeTruthy();
    });

    it.each([
      ['View Record', '/datahub/subjects/$subjectId/table/$recordId'],
      ['View Subject', '/datahub/subjects/$subjectId/table']
    ])('should open %s from the row actions, carrying where it was opened from', (label, to) => {
      renderTable();
      fireEvent.keyDown(screen.getByTestId('row-actions-trigger'), { key: 'Enter' });
      fireEvent.click(within(screen.getByTestId('row-actions-dropdown')).getByRole('menuitem', { name: label }));
      expect(navigate.mock.lastCall?.[0]).toMatchObject({ search: { fromInstrument: 'hq-1' }, to });
    });

    // The series the instrument was opened from has to survive onward navigation, or the subject hub's
    // return link loses the trail back through the series.
    it('should carry the series it was opened from onto the subject', () => {
      vi.spyOn(Route, 'useSearch').mockReturnValue({ fromSeries: 'series-1' });
      renderTable();
      fireEvent.doubleClick(screen.getByTestId('data-table-row'));
      expect(navigate.mock.lastCall?.[0]).toMatchObject({
        search: { fromInstrument: 'hq-1', fromSeries: 'series-1' }
      });
    });

    it('should open the chosen edition of the instrument', () => {
      renderTable();
      fireEvent.click(screen.getByTestId('select-edition'));
      expect(navigate).toHaveBeenCalledWith({
        params: { instrumentId: 'hq-2' },
        to: '/datahub/instruments/$instrumentId/table'
      });
    });

    // Only the timeframe itself goes in the url. An absolute date alongside it would still read "past
    // year" long after the link was shared, while bounded to the instant it was made.
    it('should record the chosen timeframe in the url, and no date derived from it', () => {
      renderTable();
      fireEvent.click(screen.getByTestId('select-time'));
      expect(lastSearch()).toEqual({ minDateKey: 'pastYear' });
    });

    it('should return the url to all time when the timeframe is cleared', () => {
      renderTable();
      fireEvent.click(screen.getByTestId('clear-time'));
      expect(lastSearch()).toEqual({ minDateKey: 'all' });
    });

    it('should drive the timeframe control from the url, so the choice survives a reload', () => {
      vi.spyOn(Route, 'useSearch').mockReturnValue({ minDateKey: 'pastMonth' });
      renderTable();
      expect(screen.getByTestId('time-dropdown').dataset.value).toBe('pastMonth');
    });

    it('should disable the export when there are no records to export', () => {
      mocks.records = [];
      renderTable();
      expect(screen.getByRole('button', { name: 'Download' }).hasAttribute('disabled')).toBe(true);
    });
  });

  describe('instrument hub table filters', () => {
    const openFilters = () => fireEvent.keyDown(screen.getByTestId('instrument-hub-filters-trigger'), { key: 'Enter' });

    it('should start with every collection method kept, so the table opens on the whole set', () => {
      renderTable();
      openFilters();
      expect(screen.getByTestId('instrument-hub-filter-method-IN_PERSON').getAttribute('data-state')).toBe('checked');
    });

    it('should drop a collection method that is unchecked', () => {
      renderTable();
      openFilters();
      fireEvent.click(screen.getByTestId('instrument-hub-filter-method-REMOTE'));
      expect(lastSearch()).toEqual({ methods: ['RETROSPECTIVE', 'IN_PERSON'] });
    });

    it('should restore a collection method that is checked again', () => {
      vi.spyOn(Route, 'useSearch').mockReturnValue({ methods: ['IN_PERSON'] });
      renderTable();
      openFilters();
      fireEvent.click(screen.getByTestId('instrument-hub-filter-method-REMOTE'));
      expect(lastSearch()).toEqual({ methods: ['IN_PERSON', 'REMOTE'] });
    });

    it('should offer each series its records were collected under by name', () => {
      mocks.facets.seriesOptions = new Map([['series-1', 'Repeated Battery']]);
      renderTable();
      openFilters();
      expect(screen.getByTestId('instrument-hub-filter-series-series-1').textContent).toBe('Repeated Battery');
    });

    // A record may name a series the caller cannot read, leaving the id as the only available label.
    it('should offer a series it cannot name by its id', () => {
      mocks.facets.seriesOptions = new Map([['series-1', null]]);
      renderTable();
      openFilters();
      expect(screen.getByTestId('instrument-hub-filter-series-series-1').textContent).toBe('series-1');
    });

    it('should label the records collected outside any series as individual', () => {
      mocks.facets.seriesOptions = new Map([['', null]]);
      renderTable();
      openFilters();
      expect(screen.getByTestId('instrument-hub-filter-series-individual').textContent).toBe('Individual');
    });

    it('should drop a series that is unchecked', () => {
      mocks.facets.seriesOptions = new Map([
        ['series-1', 'Repeated Battery'],
        ['series-2', 'Other Battery']
      ]);
      renderTable();
      openFilters();
      fireEvent.click(screen.getByTestId('instrument-hub-filter-series-series-1'));
      expect(lastSearch()).toEqual({ series: ['series-2'] });
    });

    it('should restore a series that is checked again', () => {
      mocks.facets.seriesOptions = new Map([
        ['series-1', 'Repeated Battery'],
        ['series-2', 'Other Battery']
      ]);
      vi.spyOn(Route, 'useSearch').mockReturnValue({ series: ['series-2'] });
      renderTable();
      openFilters();
      fireEvent.click(screen.getByTestId('instrument-hub-filter-series-series-1'));
      expect(lastSearch()).toEqual({ series: ['series-2', 'series-1'] });
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
    it('should pass the url minRecords to the instrument table', () => {
      vi.spyOn(Route, 'useSearch').mockReturnValue({ minRecords: 3 });
      renderTable();
      expect(screen.getByTestId('series-min-records').textContent).toBe('3');
    });

    it('should persist the minimum records filter in the url', () => {
      renderTable();
      fireEvent.click(screen.getByTestId('change-min-records'));
      expect(lastSearch()).toEqual({ minRecords: 5 });
    });

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
});
