import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentTable } from '@/components/InstrumentTable';
import type { InstrumentRow } from '@/components/InstrumentTable';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  download: vi.fn(),
  downloadExcel: vi.fn()
}));

vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download,
  useNotificationsStore: (selector: (store: { addNotification: typeof mocks.addNotification }) => unknown) =>
    selector({ addNotification: mocks.addNotification })
}));
vi.mock('@/utils/excel', () => ({ downloadSubjectTableExcel: mocks.downloadExcel }));

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

const listedTitles = () =>
  screen.queryAllByTestId('data-table-row').map((tableRow) => tableRow.querySelector('div')!.textContent?.trim() ?? '');

const openFilters = () => fireEvent.keyDown(screen.getByTestId('instrument-table-filters-trigger'), { key: 'Enter' });

describe('InstrumentTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

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

  it('should hide instruments nothing was ever collected for when that filter is checked', () => {
    renderTable([row(), row({ id: 'never-1', recordCount: 0, subjectCount: 0, title: 'Never Collected' })]);
    openFilters();
    fireEvent.click(screen.getByTestId('instrument-table-filter-has-records'));
    expect(listedTitles()).toStrictEqual(['Happiness Questionnaire']);
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

  // The export is of what the table is listing, so a filtered view and its download agree.
  it('should export only the rows left after filtering', () => {
    renderTable([row(), row({ id: 'stroop-1', kind: 'INTERACTIVE', title: 'Stroop Task' })]);
    openFilters();
    fireEvent.click(screen.getByTestId('instrument-table-filter-kind-FORM'));
    // The open filter menu makes the rest of the page inert, so it has to be dismissed first.
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Export' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'CSV' }));
    const [, getContents] = mocks.download.mock.lastCall!;
    const csv = (getContents as () => string)();
    expect(csv).toContain('Stroop Task');
    expect(csv).not.toContain('Happiness Questionnaire');
  });
});
