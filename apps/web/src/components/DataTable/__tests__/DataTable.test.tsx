import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataTable } from '@/components/DataTable/DataTable';
import type { DataTableProps } from '@/components/DataTable/DataTable';
import { savedTableViews } from '@/services/table-views';

import '@/services/i18n';

type Row = { name: string };

const NAME_LABEL = 'Name';
const FILTER_LABEL = 'Filter';
const REFILTER_LABEL = 'Refilter';

const makeRows = (count: number): Row[] => {
  return Array.from({ length: count }, (_, index) => ({ name: `row ${String(index + 1).padStart(2, '0')}` }));
};

const columns: TanstackTable.ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {NAME_LABEL}
      </button>
    )
  }
];

type ClientProps = Partial<Extract<DataTableProps<Row>, { mode?: 'client' }>>;

const renderTable = (props: ClientProps = {}) => {
  return render(<DataTable columns={columns} data={makeRows(25)} tableName="rows" {...props} />);
};

const firstRowText = () => screen.getAllByTestId('data-table-row')[0]!.textContent;

/** Tanstack queues its automatic page reset as a microtask, so a test must let it run. */
const flushQueuedReset = () => act(() => Promise.resolve());

const goToPage = (page: number) => fireEvent.click(screen.getByRole('button', { name: String(page) }));

const remount = async (props: ClientProps = {}) => {
  cleanup();
  renderTable(props);
  await flushQueuedReset();
};

describe('DataTable', () => {
  beforeEach(() => {
    savedTableViews.clear();
  });

  afterEach(cleanup);

  it('should open on the page it was left on, so returning from a row does not restart the list', async () => {
    renderTable();
    goToPage(2);
    await remount();
    expect(firstRowText()).toBe('row 11');
  });

  it('should keep the sort it was left with', async () => {
    renderTable();
    fireEvent.click(screen.getByText('Name'));
    fireEvent.click(screen.getByText('Name'));
    await remount();
    expect(firstRowText()).toBe('row 25');
  });

  it('should open on the first page when left mid-search, since the search box opens empty', async () => {
    renderTable();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'row' } });
    goToPage(2);
    await remount();
    expect(firstRowText()).toBe('row 01');
  });

  it('should open on the first page when left with a column filter changed', async () => {
    renderTable({
      togglesComponent: ({ table }) => (
        <button type="button" onClick={() => table.getColumn('name')!.setFilterValue('row')}>
          {FILTER_LABEL}
        </button>
      )
    });
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    goToPage(2);
    await remount();
    expect(firstRowText()).toBe('row 01');
  });

  it('should open on the last page when the rows it was left on no longer exist', async () => {
    renderTable();
    goToPage(3);
    await remount({ data: makeRows(12) });
    expect(firstRowText()).toBe('row 11');
  });

  it('should stay on its page when the rows are refetched, as after returning from editing one', async () => {
    const { rerender } = renderTable();
    await flushQueuedReset();
    goToPage(2);
    rerender(<DataTable columns={columns} data={makeRows(26)} tableName="rows" />);
    await flushQueuedReset();
    expect(firstRowText()).toBe('row 11');
  });

  it('should move to the last page when a refetch leaves fewer pages than the one shown', () => {
    const { rerender } = renderTable();
    goToPage(3);
    rerender(<DataTable columns={columns} data={makeRows(15)} tableName="rows" />);
    expect(firstRowText()).toBe('row 11');
  });

  it('should return to the first page when the search changes, since the page no longer applies', () => {
    renderTable();
    goToPage(2);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'row' } });
    expect(firstRowText()).toBe('row 01');
  });

  it('should stay on its page when a filter is set to the value it already has', () => {
    renderTable({
      togglesComponent: ({ table }) => (
        <button type="button" onClick={() => table.setColumnFilters((filters) => [...filters])}>
          {REFILTER_LABEL}
        </button>
      )
    });
    goToPage(2);
    fireEvent.click(screen.getByRole('button', { name: 'Refilter' }));
    expect(firstRowText()).toBe('row 11');
  });

  it('should return to the first page when the sort changes', () => {
    renderTable();
    goToPage(2);
    fireEvent.click(screen.getByText('Name'));
    expect(firstRowText()).toBe('row 01');
  });

  it('should return to the first page when the caller filters its rows differently', () => {
    const { rerender } = renderTable({ pageResetKey: 0 });
    goToPage(2);
    rerender(<DataTable columns={columns} data={makeRows(25)} pageResetKey={5} tableName="rows" />);
    expect(firstRowText()).toBe('row 01');
  });

  it('should stay on its page when the caller re-renders with the same filters', () => {
    const { rerender } = renderTable({ pageResetKey: [0, 'all'] });
    goToPage(2);
    rerender(<DataTable columns={columns} data={makeRows(25)} pageResetKey={[0, 'all']} tableName="rows" />);
    expect(firstRowText()).toBe('row 11');
  });

  it('should open on the first page when left with the caller filtering differently from when it opened', async () => {
    const { rerender } = renderTable({ pageResetKey: 0 });
    rerender(<DataTable columns={columns} data={makeRows(25)} pageResetKey={5} tableName="rows" />);
    goToPage(2);
    await remount();
    expect(firstRowText()).toBe('row 01');
  });

  it('should keep the page it reopens on while its rows are still loading', async () => {
    renderTable();
    goToPage(2);
    cleanup();
    const { rerender } = renderTable({ data: [] });
    await flushQueuedReset();
    rerender(<DataTable columns={columns} data={makeRows(25)} tableName="rows" />);
    await flushQueuedReset();
    expect(firstRowText()).toBe('row 11');
  });

  it('should save and restore under its new name when renamed in place, as on a group switch', async () => {
    savedTableViews.set('group b', { pageIndex: 2, sorting: [] });
    const { rerender } = renderTable({ tableName: 'group a' });
    goToPage(2);
    rerender(<DataTable columns={columns} data={makeRows(25)} tableName="group b" />);
    await flushQueuedReset();
    expect(firstRowText()).toBe('row 21');
    expect(savedTableViews.get('group a')?.pageIndex).toBe(1);
  });

  it('should keep each table on its own page, keyed by table name', async () => {
    renderTable();
    goToPage(2);
    await remount({ tableName: 'other rows' });
    expect(firstRowText()).toBe('row 01');
  });

  it('should keep the id Tanstack derives from a string header, so the column can still be found', () => {
    const getColumn = vi.fn();
    renderTable({
      columns: [{ accessorFn: (row) => row.name, header: 'Name' }],
      togglesComponent: ({ table }) => {
        getColumn(table.getColumn('Name')?.id);
        return null;
      }
    });
    expect(getColumn).toHaveBeenLastCalledWith('Name');
  });

  it('should render a header that is plain text', () => {
    renderTable({ columns: [{ accessorKey: 'name', header: 'Plain Name' }] });
    expect(screen.getByText('Plain Name')).toBeTruthy();
  });

  it('should leave a column without a header as it is', () => {
    renderTable({ columns: [...columns, { accessorKey: 'name', id: 'unlabelled' }] });
    expect(screen.getAllByTestId('data-table-row')).toHaveLength(10);
  });

  it('should refuse columns without any header, since a header is how it reaches the table', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderTable({ columns: [{ accessorKey: 'name' }] })).toThrow(
      'Expected at least one DataTable column to define a header'
    );
  });

  it('should leave a server-mode table to its caller, which holds the page it requests', () => {
    const onPaginationChange = vi.fn();
    savedTableViews.set('rows', { pageIndex: 1, sorting: [] });
    render(
      <DataTable
        columns={columns}
        data={makeRows(10)}
        mode="server"
        pageCount={3}
        pageResetKey={0}
        tableName="rows"
        onPaginationChange={onPaginationChange}
      />
    );
    expect(firstRowText()).toBe('row 01');
    expect(onPaginationChange).not.toHaveBeenCalled();
  });
});
