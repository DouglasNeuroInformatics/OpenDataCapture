import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentTable } from '@/components/InstrumentTable';
import type { InstrumentRow } from '@/components/InstrumentTable';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  download: vi.fn(),
  downloadExcel: vi.fn(),
  instrumentInfo: [] as { details: { title: string }; id: string; kind: string }[]
}));

vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download,
  useNotificationsStore: (selector: (store: { addNotification: typeof mocks.addNotification }) => unknown) =>
    selector({ addNotification: mocks.addNotification })
}));
vi.mock('@/utils/excel', () => ({ downloadSubjectTableExcel: mocks.downloadExcel }));
// The table resolves a row's full details for the preview dialog, which a row only names by id.
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo })
}));

const row = (overrides: Partial<InstrumentRow> = {}): InstrumentRow => ({
  edition: 1,
  id: 'hq-1',
  kind: 'FORM',
  lastCollectedAt: new Date('2025-02-02'),
  recordCount: 3,
  source: null,
  subjectCount: 2,
  title: 'Happiness Questionnaire',
  ...overrides
});

const renderTable = (rows: InstrumentRow[], onOpen = vi.fn()) => {
  render(<InstrumentTable rows={rows} onOpen={onOpen} />);
  return onOpen;
};

const renderTableWithRecordExport = (rows: InstrumentRow[]) => {
  const recordExport = vi.fn();
  render(<InstrumentTable recordExport={recordExport} rows={rows} onOpen={vi.fn()} />);
  return recordExport;
};

const openExport = () => fireEvent.keyDown(screen.getByRole('button', { name: 'Download' }), { key: 'Enter' });

const exportItems = () => screen.queryAllByRole('menuitem').map((item) => item.textContent);

const listedTitles = () =>
  screen.queryAllByTestId('data-table-row').map((tableRow) => tableRow.querySelector('div')!.textContent?.trim() ?? '');

const openFilters = () => fireEvent.keyDown(screen.getByTestId('instrument-table-filters-trigger'), { key: 'Enter' });

beforeEach(() => {
  vi.clearAllMocks();
  i18n.changeLanguage('en');
});

afterEach(cleanup);

describe('InstrumentTable', () => {
  it('should list a row per instrument it is given', () => {
    renderTable([row(), row({ id: 'stroop-1', kind: 'INTERACTIVE', title: 'Stroop Task' })]);
    expect(listedTitles()).toStrictEqual(['Happiness Questionnaire', 'Stroop Task']);
  });

  it('should show the record and subject counts as given, not one derived from the other', () => {
    renderTable([row({ recordCount: 3, subjectCount: 2 })]);
    const cells = screen.getAllByTestId('data-table-row')[0]!.textContent;
    expect(cells).toContain('3');
    expect(cells).toContain('2');
  });

  it('should tag the kind with its translated name rather than the stored enum', () => {
    renderTable([row({ kind: 'INTERACTIVE' })]);
    expect(screen.getByTestId('instrument-cell-kind').textContent).toBe('Interactive');
  });

  // The filter menu narrows on the same values the cells show, so offering the raw enum there while
  // the cell is translated would read as two different vocabularies for one column.
  it('should offer translated kind names in the filter menu', () => {
    renderTable([row()]);
    openFilters();
    expect(screen.getByTestId('instrument-table-filter-kind-INTERACTIVE').textContent).toBe('Interactive');
    expect(screen.getByTestId('instrument-table-filter-kind-SERIES').textContent).toBe('Series');
  });

  it('should hide an instrument whose kind is unchecked', () => {
    renderTable([row(), row({ id: 'stroop-1', kind: 'INTERACTIVE', title: 'Stroop Task' })]);
    openFilters();
    fireEvent.click(screen.getByTestId('instrument-table-filter-kind-FORM'));
    expect(listedTitles()).toStrictEqual(['Stroop Task']);
  });

  it('should list only instruments holding at least the minimum number of records', () => {
    renderTable([row(), row({ id: 'never-1', recordCount: 0, subjectCount: 0, title: 'Never Collected' })]);
    openFilters();
    fireEvent.change(screen.getByTestId('instrument-table-filter-min-records'), { target: { value: '1' } });
    expect(listedTitles()).toStrictEqual(['Happiness Questionnaire']);
  });

  it('should list every instrument again when the minimum record count is cleared', () => {
    renderTable([row(), row({ id: 'never-1', recordCount: 0, subjectCount: 0, title: 'Never Collected' })]);
    openFilters();
    const minRecords = screen.getByTestId('instrument-table-filter-min-records');
    fireEvent.change(minRecords, { target: { value: '1' } });
    fireEvent.change(minRecords, { target: { value: '' } });
    expect(listedTitles()).toStrictEqual(['Happiness Questionnaire', 'Never Collected']);
  });

  it('should exclude an instrument whose record count falls short of the minimum', () => {
    renderTable([row({ recordCount: 3 })]);
    openFilters();
    fireEvent.change(screen.getByTestId('instrument-table-filter-min-records'), { target: { value: '4' } });
    expect(listedTitles()).toStrictEqual([]);
  });

  it('should hide an instrument last collected outside the chosen window', () => {
    renderTable([
      row({ lastCollectedAt: new Date('2020-01-01') }),
      row({ id: 'recent-1', lastCollectedAt: new Date(), title: 'Recently Collected' })
    ]);
    openFilters();
    fireEvent.change(screen.getByTestId('instrument-table-filter-collected-preset'), {
      target: { value: 'pastMonth' }
    });
    expect(listedTitles()).toStrictEqual(['Recently Collected']);
  });

  // An instrument nothing was collected for has no date to compare, so a window cannot admit it,
  // but "any time" must leave it listed.
  it('should keep a never-collected instrument only while the window is any time', () => {
    renderTable([row({ id: 'never-1', lastCollectedAt: null, title: 'Never Collected' })]);
    openFilters();
    expect(listedTitles()).toStrictEqual(['Never Collected']);
    fireEvent.change(screen.getByTestId('instrument-table-filter-collected-preset'), {
      target: { value: 'pastYear' }
    });
    expect(listedTitles()).toStrictEqual([]);
  });

  it('should narrow to an explicit window when the preset is custom', () => {
    renderTable([
      row({ lastCollectedAt: new Date('2025-02-02') }),
      row({ id: 'old-1', lastCollectedAt: new Date('2021-01-01'), title: 'Older' })
    ]);
    openFilters();
    fireEvent.change(screen.getByTestId('instrument-table-filter-collected-preset'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByTestId('instrument-table-filter-collected-min'), {
      target: { value: '2024-01-01' }
    });
    expect(listedTitles()).toStrictEqual(['Happiness Questionnaire']);
  });

  // Offered by the table itself rather than by each listing, so the hub index and a series' member
  // list both have it instead of only whichever page remembered to wire it up.
  it('should offer a preview beside view in every row menu', () => {
    renderTable([row()]);
    fireEvent.keyDown(screen.getAllByTestId('row-actions-trigger')[0]!, { key: 'Enter' });
    expect(screen.queryAllByRole('menuitem').map((item) => item.textContent)).toStrictEqual(['View', 'Preview']);
  });

  it('should open an instrument when its row is double-clicked', () => {
    const onOpen = renderTable([row()]);
    fireEvent.doubleClick(screen.getAllByTestId('data-table-row')[0]!);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'hq-1' }));
  });

  it('should match the search against the instrument title', () => {
    renderTable([row(), row({ id: 'stroop-1', title: 'Stroop Task' })]);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'stroop' } });
    expect(listedTitles()).toStrictEqual(['Stroop Task']);
  });

  // A download whose columns arrive in a different order than the table just showed makes the
  // reader re-find every field, so the header order follows the column order rather than the
  // alphabet `perfectionist/sort-objects` would impose on an object literal.
  it('should order the exported columns the way the table shows them', () => {
    renderTable([row()]);
    openExport();
    fireEvent.click(screen.getByTestId('instrument-table-export-listing-CSV'));
    const [, getContents] = mocks.download.mock.lastCall!;
    const [header] = (getContents as () => string)().split('\r\n');
    expect(header).toBe('Instrument,Subjects,Records,LastCollected,Kind,Edition,Source');
  });

  it('should name the absence rather than leaving a blank cell for a never-collected instrument', () => {
    renderTable([row({ edition: null, lastCollectedAt: null })]);
    openExport();
    fireEvent.click(screen.getByTestId('instrument-table-export-listing-JSON'));
    const [, getContents] = mocks.download.mock.lastCall!;
    const [exported] = JSON.parse((getContents as () => string)()) as { Edition: string; LastCollected: string }[];
    expect(exported!.LastCollected).toBe('None');
    expect(exported!.Edition).toBe('None');
  });

  // The export is of what the table is listing, so a filtered view and its download agree.
  it('should export only the rows left after filtering', () => {
    renderTable([row(), row({ id: 'stroop-1', kind: 'INTERACTIVE', title: 'Stroop Task' })]);
    openFilters();
    fireEvent.click(screen.getByTestId('instrument-table-filter-kind-FORM'));
    // The open filter menu makes the rest of the page inert, so it has to be dismissed first.
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    openExport();
    fireEvent.click(screen.getByTestId('instrument-table-export-listing-CSV'));
    const [, getContents] = mocks.download.mock.lastCall!;
    const csv = (getContents as () => string)();
    expect(csv).toContain('Stroop Task');
    expect(csv).not.toContain('Happiness Questionnaire');
  });

  // The hub index lists unrelated instruments, so there is no one set of records a single file
  // could describe — only a series' own page supplies the second section.
  it('should offer only the listing formats when no record export is supplied', () => {
    renderTable([row()]);
    openExport();
    expect(screen.queryByText('Subject data')).toBeNull();
    expect(exportItems()).toStrictEqual(['CSV', 'JSON', 'Excel']);
  });

  // With nothing to tell it apart from, the heading only repeats what the button said.
  it('should leave the menu unheaded when it holds a single section', () => {
    renderTable([row()]);
    openExport();
    expect(screen.queryByText('Instrument list')).toBeNull();
  });
});

describe('InstrumentTable record export', () => {
  it('should split the menu into a listing section and a subject-data section', () => {
    renderTableWithRecordExport([row()]);
    openExport();
    expect(screen.getByText('Instrument list')).toBeTruthy();
    expect(screen.getByText('Subject data')).toBeTruthy();
  });

  // Both shapes of every format: wide spreads each instrument's measures across columns, long
  // carries one row per measured value, and a series is legible either way.
  it.each(['TSV', 'TSV Long', 'JSON', 'CSV', 'CSV Long', 'Excel', 'Excel Long'])(
    'should request the %s shape when it is chosen',
    (option) => {
      const recordExport = renderTableWithRecordExport([row()]);
      openExport();
      fireEvent.click(screen.getByTestId(`instrument-table-export-records-${option}`));
      expect(recordExport).toHaveBeenCalledWith(option);
    }
  );

  it('should keep the listing export separate from the subject-data export', () => {
    const recordExport = renderTableWithRecordExport([row()]);
    openExport();
    fireEvent.click(screen.getByTestId('instrument-table-export-listing-JSON'));
    expect(recordExport).not.toHaveBeenCalled();
    expect(mocks.download).toHaveBeenCalledWith(expect.stringMatching(/\.json$/), expect.any(Function));
  });
});
