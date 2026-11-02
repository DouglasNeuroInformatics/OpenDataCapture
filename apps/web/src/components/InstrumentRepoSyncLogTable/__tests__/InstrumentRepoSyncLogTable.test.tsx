import type { InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstrumentRepoSyncLogTable } from '../InstrumentRepoSyncLogTable';

import '@/services/i18n';

const theme = vi.hoisted(() => ({ current: 'light' }));

vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useTheme: () => [theme.current, vi.fn()]
}));

const logFixture = (overrides: Partial<InstrumentRepoSyncLog> = {}): InstrumentRepoSyncLog => ({
  action: 'SYNC',
  createdAt: new Date('2026-10-01T12:00:00Z'),
  failures: [],
  id: 'log-1',
  importedCount: 4,
  message: null,
  repoId: 'repo-1',
  repoName: 'Core Repo',
  updatedAt: new Date('2026-10-01T12:00:00Z'),
  ...overrides
});

type TableProps = {
  logs: InstrumentRepoSyncLog[];
  onPageChange?: (page: number) => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
  pageCount?: number;
  sortOrder?: 'asc' | 'desc';
};

const Table = ({ pageCount = 1, sortOrder = 'desc', ...props }: TableProps) => (
  <InstrumentRepoSyncLogTable
    pageCount={pageCount}
    sortOrder={sortOrder}
    onPageChange={() => undefined}
    onSortOrderChange={() => undefined}
    {...props}
  />
);

const rows = () => screen.getAllByTestId('data-table-row');

const statuses = () => screen.getAllByTestId('sync-log-status').map((badge) => badge.textContent);

describe('InstrumentRepoSyncLogTable', () => {
  afterEach(() => {
    cleanup();
    theme.current = 'light';
  });

  it('should say so in one line when there is nothing to show, rather than render an empty table', () => {
    render(<Table logs={[]} />);
    expect(screen.getByText('No imports or syncs recorded yet.')).toBeTruthy();
    expect(screen.queryByTestId('data-table')).toBeNull();
  });

  it('should keep the empty log the colour and height of a table, so it does not vanish into the card', () => {
    render(<Table logs={[]} />);
    const empty = screen.getByTestId('instrument-repo-sync-log');
    expect(empty.className).toContain('bg-background');
    expect(empty.className).toContain('min-h-60');
  });

  it('should hold the table open to five rows, so a single entry does not collapse it', () => {
    render(<Table logs={[logFixture()]} />);
    expect(screen.getByTestId('instrument-repo-sync-log').className).toContain('min-h-[205px]');
  });

  it('should hold no error text in the cell, only a View button, so every row stays one line', () => {
    render(<Table logs={[logFixture({ failures: [{ instrumentDir: 'A', message: 'broken', stage: 'LOAD' }] })]} />);
    expect(within(rows()[0]!).queryByText('broken')).toBeNull();
    expect(within(rows()[0]!).getByTestId('sync-log-view-messages').textContent).toBe('View');
  });

  it('should show every failure in full when View is clicked, since the cell holds none of it', () => {
    const message = 'Transform failed with 1 error: /BROKEN_FORM/index.ts:14:22: ERROR: Expected ")" but found "{"';
    render(
      <Table
        logs={[
          logFixture({
            failures: [
              { instrumentDir: 'BROKEN_FORM', message, stage: 'BUNDLE' },
              { instrumentDir: 'MOCA_V2', message: 'details.title: Expected string', stage: 'LOAD' }
            ]
          })
        ]}
      />
    );
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    const details = screen.getByTestId('sync-log-error-details');
    expect(within(details).getByText(message)).toBeTruthy();
    expect(within(details).getByText('details.title: Expected string')).toBeTruthy();
    expect(within(details).getByText('BROKEN_FORM')).toBeTruthy();
    expect(within(details).getByText('Compile')).toBeTruthy();
  });

  it('should close the error dialog on dismissal, so another row can be inspected next', () => {
    render(<Table logs={[logFixture({ failures: [{ instrumentDir: 'A', message: 'broken', stage: 'LOAD' }] })]} />);
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    expect(screen.queryByTestId('sync-log-error-details')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByTestId('sync-log-error-details')).toBeNull();
  });

  it('should show the reason the whole repository could not be read in the dialog too', () => {
    render(<Table logs={[logFixture({ message: 'Repository not found (404)' })]} />);
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    expect(within(screen.getByTestId('sync-log-error-details')).getByText('Repository not found (404)')).toBeTruthy();
  });

  it('should mark a sync with no failed instrument as a success', () => {
    render(<Table logs={[logFixture()]} />);
    expect(statuses()).toEqual(['Success']);
    expect(within(rows()[0]!).getByText('-')).toBeTruthy();
    expect(screen.queryByTestId('sync-log-view-messages')).toBeNull();
  });

  it('should mark a sync that skipped some instruments as a partial success', () => {
    render(
      <Table
        logs={[
          logFixture({
            failures: [{ instrumentDir: 'PHQ_9', message: 'Instrument validation failed', stage: 'LOAD' }]
          })
        ]}
      />
    );
    expect(statuses()).toEqual(['Partial success']);
  });

  it('should mark a sync that could not read the repository as failed', () => {
    render(<Table logs={[logFixture({ importedCount: 0, message: 'Repository not found' })]} />);
    expect(statuses()).toEqual(['Failed']);
  });

  it('should label an import and a compile failure in words rather than as codes', () => {
    render(
      <Table
        logs={[logFixture({ action: 'IMPORT', failures: [{ instrumentDir: 'A', message: 'x', stage: 'BUNDLE' }] })]}
      />
    );
    expect(within(rows()[0]!).getByText('Import')).toBeTruthy();
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    expect(within(screen.getByTestId('sync-log-error-details')).getByText('Compile')).toBeTruthy();
  });

  it('should render the page in the order it was given, since the server does the ordering', () => {
    render(
      <Table
        logs={[
          logFixture({ createdAt: new Date('2026-10-01'), id: 'newer', repoName: 'Newer' }),
          logFixture({ createdAt: new Date('2026-09-01'), id: 'older', repoName: 'Older' })
        ]}
      />
    );
    expect(within(rows()[0]!).getByText('Newer')).toBeTruthy();
  });

  it('should ask for the other order when the date header is clicked, rather than sort the page', () => {
    const onSortOrderChange = vi.fn();
    render(<Table logs={[logFixture()]} onSortOrderChange={onSortOrderChange} />);

    fireEvent.click(within(screen.getByTestId('data-table-head')).getByText('Date'));

    expect(onSortOrderChange).toHaveBeenCalledWith('asc');
  });

  it('should cycle the order it asks for, since the column clears back to ascending', () => {
    const onSortOrderChange = vi.fn();
    render(<Table logs={[logFixture()]} onSortOrderChange={onSortOrderChange} />);
    const date = within(screen.getByTestId('data-table-head')).getByText('Date');

    fireEvent.click(date);
    fireEvent.click(date);
    fireEvent.click(date);

    expect(onSortOrderChange.mock.calls.flat()).toEqual(['asc', 'desc', 'asc']);
  });

  it('should offer no sorting on a column the server cannot order by, so no control can mislead', () => {
    render(<Table logs={[logFixture({ message: 'Repository not found' })]} />);
    const head = within(screen.getByTestId('data-table-head'));
    expect(head.getByText('Date').tagName).toBe('BUTTON');
    expect(head.getByText('Status').tagName).not.toBe('BUTTON');
    expect(head.getByText('Repository').tagName).not.toBe('BUTTON');
  });

  it('should ask for the next page rather than hold the whole history', () => {
    const onPageChange = vi.fn();
    render(<Table logs={[logFixture()]} pageCount={3} onPageChange={onPageChange} />);

    // The arrows carry no accessible name, so the test drives the numbered page button.
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should hold every cell to one line, so no row can stand taller than the rest', () => {
    const createdAt = new Date('2026-10-01T12:00:00Z');
    render(<Table logs={[logFixture({ createdAt, importedCount: 7, repoName: 'A Very Long Repository Name' })]} />);
    const row = within(rows()[0]!);
    const cells = [
      row.getByText(createdAt.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })),
      row.getByText('A Very Long Repository Name'),
      row.getByText('Sync'),
      row.getByText('7')
    ];
    cells.forEach((cell) => expect(cell.className).toContain('whitespace-nowrap'));
  });

  it('should carry the full repository name as a hover title, since the cell may clip it', () => {
    const repoName = 'LaboratoireDeRecherche/instruments-cliniques-internes';
    render(<Table logs={[logFixture({ repoName })]} />);
    expect(screen.getByTestId('sync-log-repo-name').title).toBe(repoName);
  });

  it('should name the unabbreviated date on hover, since the cell shows a short form', () => {
    const createdAt = new Date('2026-10-01T12:00:00Z');
    render(<Table logs={[logFixture({ createdAt })]} />);
    const cell = within(rows()[0]!).getByText(
      createdAt.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    );
    expect(cell.title).toBe(createdAt.toLocaleString());
  });

  it('should pin every column but the repository, so a long repository name has the leftover room', () => {
    render(<Table logs={[logFixture()]} />);
    const head = within(screen.getByTestId('data-table-head'));
    const cellOf = (label: string) => head.getByText(label).closest('div')!;
    expect(cellOf('Date').style.position).toBe('sticky');
    expect(cellOf('Imported').style.position).toBe('sticky');
    expect(cellOf('Repository').style.position).toBe('');
  });

  it('should colour the status dot for the dark theme when the app is dark', () => {
    theme.current = 'dark';
    render(<Table logs={[logFixture()]} />);
    const dot = screen.getByTestId('sync-log-status').firstElementChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe('#22c55e');
  });

  it('should colour the status dot for the light theme otherwise', () => {
    render(<Table logs={[logFixture({ message: 'Repository not found' })]} />);
    const dot = screen.getByTestId('sync-log-status').firstElementChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe('#dc2626');
  });
});
