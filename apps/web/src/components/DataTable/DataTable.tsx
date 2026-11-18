import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { DataTable as LibuiDataTable } from '@douglasneuroinformatics/libui/components';
import type { DataTableProps as LibuiDataTableProps, TanstackTable } from '@douglasneuroinformatics/libui/components';

import { savedTableViews } from '@/services/table-views';

/**
 * libui hands the Tanstack table to no prop that every table renders: the toggles and the search
 * callback are skipped under `disableSearch`. Every visible column renders its header, so each
 * header captures it.
 */
function withTableCapture<TRow extends TanstackTable.RowData>(
  columns: TanstackTable.ColumnDef<TRow>[],
  tableRef: RefObject<null | TanstackTable.Table<TRow>>
): TanstackTable.ColumnDef<TRow>[] {
  if (!columns.some((column) => column.header !== undefined)) {
    throw new Error('Expected at least one DataTable column to define a header');
  }
  return columns.map((column) => {
    const { header: Header } = column;
    if (Header === undefined) {
      return column;
    }
    // Tanstack names a column without an id or accessorKey after its string header, so replacing
    // that header with a function would rename the column unless the id is kept.
    const id = column.id ?? ('accessorKey' in column || typeof Header !== 'string' ? undefined : Header);
    return {
      ...column,
      header: (context: TanstackTable.HeaderContext<TRow, unknown>) => {
        tableRef.current = context.table;
        return typeof Header === 'function' ? <Header {...context} /> : Header;
      },
      id
    } as TanstackTable.ColumnDef<TRow>;
  });
}

/**
 * Tanstack sends a table back to page one whenever its rows recompute, so a refetch of the same
 * list would undo the page restored on return. The table returns to page one only when what
 * selects or orders its rows changes, which is when the page the user was on stops meaning anything.
 */
function keepPageAcrossRefetches<TRow extends TanstackTable.RowData>(table: TanstackTable.Table<TRow>) {
  const returnToFirstPageOnChange = <TKey extends 'columnFilters' | 'globalFilter' | 'sorting'>(
    key: TKey,
    onChange: TanstackTable.OnChangeFn<TanstackTable.TableState[TKey]> | undefined
  ): TanstackTable.OnChangeFn<TanstackTable.TableState[TKey]> => {
    return (updater) => {
      const previous = JSON.stringify(table.getState()[key]);

      onChange!(updater);
      if (JSON.stringify(table.getState()[key]) !== previous) {
        table.setPageIndex(0);
      }
    };
  };
  // libui's store rebuilds the options from the previous ones on every update, so these survive it.
  table.setOptions((options) => ({
    ...options,
    autoResetPageIndex: false,
    onColumnFiltersChange: returnToFirstPageOnChange('columnFilters', options.onColumnFiltersChange),
    onGlobalFilterChange: returnToFirstPageOnChange('globalFilter', options.onGlobalFilterChange),
    onSortingChange: returnToFirstPageOnChange('sorting', options.onSortingChange)
  }));
}

const ClientDataTable = <TRow extends TanstackTable.RowData>({
  pageResetKey,
  tableName,
  ...props
}: Extract<DataTableProps<TRow>, { mode?: 'client' }>) => {
  const tableRef = useRef<null | TanstackTable.Table<TRow>>(null);
  const [savedView] = useState(() => savedTableViews.get(tableName));
  const columns = useMemo(() => withTableCapture(props.columns, tableRef), [props.columns]);
  const serializedPageResetKey = JSON.stringify(pageResetKey);
  const pageResetKeyRef = useRef(serializedPageResetKey);

  useEffect(() => {
    const table = tableRef.current!;
    keepPageAcrossRefetches(table);
    if (savedView) {
      table.setPageIndex(savedView.pageIndex);
    }
    const columnFiltersOnOpen = JSON.stringify(table.getState().columnFilters);
    const pageResetKeyOnOpen = serializedPageResetKey;
    return () => {
      const { columnFilters, globalFilter, pagination, sorting } = table.getState();
      const isFiltered =
        Boolean(globalFilter) ||
        JSON.stringify(columnFilters) !== columnFiltersOnOpen ||
        pageResetKeyRef.current !== pageResetKeyOnOpen;
      savedTableViews.set(tableName, { pageIndex: isFiltered ? 0 : pagination.pageIndex, sorting });
    };
  }, []);

  useEffect(() => {
    if (pageResetKeyRef.current !== serializedPageResetKey) {
      pageResetKeyRef.current = serializedPageResetKey;
      tableRef.current!.setPageIndex(0);
    }
  }, [serializedPageResetKey]);

  useEffect(() => {
    const table = tableRef.current!;
    // Rows still loading would clamp a restored page to the first before they arrive.
    if (props.data.length === 0) {
      return;
    }
    const lastPageIndex = Math.max(table.getPageCount() - 1, 0);
    if (table.getState().pagination.pageIndex > lastPageIndex) {
      table.setPageIndex(lastPageIndex);
    }
  }, [props.data]);

  return (
    <LibuiDataTable
      {...props}
      columns={columns}
      initialState={{ ...props.initialState, sorting: savedView?.sorting ?? props.initialState?.sorting }}
      tableName={tableName}
    />
  );
};

/**
 * The libui `DataTable`, returning to the page and sort the user left it on. libui keeps both in
 * state that unmounts with the table, so without this a list opened again from a row's page always
 * starts on page one.
 *
 * A view left while searching or filtering keeps its sort but not its page: the search box always
 * opens empty, so the saved page would index rows the user never saw. A server-mode table is passed
 * through untouched, since its caller already holds the page and sort it requests.
 */
export const DataTable = <TRow extends TanstackTable.RowData>(props: DataTableProps<TRow>) => {
  if (props.mode === 'server') {
    const { pageResetKey: _, ...serverProps } = props;
    return <LibuiDataTable {...serverProps} />;
  }
  // Keyed by name, so a table renamed in place (a group switch, say) restores and saves its own view.
  return <ClientDataTable key={props.tableName} {...props} />;
};

export type DataTableProps<TRow extends TanstackTable.RowData> = LibuiDataTableProps<TRow> & {
  /**
   * The filters a caller applies to `data` itself, outside the table's search and column filters.
   * The table returns to page one when it changes; any other change of `data` is taken for a
   * refetch of the same rows, which keeps the page.
   */
  pageResetKey?: unknown;
  /** Keys the page and sort this table returns to after the user leaves it, so it must be unique */
  tableName: string;
};
