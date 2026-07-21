import { useMemo, useState } from 'react';

import { DataTable } from '@douglasneuroinformatics/libui/components';
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTableRowHighlight, DataTableRowHighlightProvider, dataTableRowHighlightRootStyle } from '..';

import '@/services/i18n';

const rows = Array.from({ length: 11 }, (_, index) => ({
  id: String(index + 1),
  name: `Row ${index + 1}`
}));

const TestTable = () => {
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const dataTable = useMemo(
    () => (
      <DataTable
        columns={[
          {
            accessorKey: 'name',
            cell: (ctx) => (
              <span>
                {ctx.getValue() as string}
                <DataTableRowHighlight rowId={ctx.row.original.id} />
              </span>
            )
          }
        ]}
        data={rows}
        rootStyle={dataTableRowHighlightRootStyle}
        onRowClick={(row) => setHighlightedRowId(row.id)}
      />
    ),
    []
  );

  return <DataTableRowHighlightProvider rowId={highlightedRowId}>{dataTable}</DataTableRowHighlightProvider>;
};

// this suite renders more than once and the project does not register the testing-library auto-cleanup,
// so every query must be scoped to the container of its own render
const renderTestTable = () => {
  const { container } = render(<TestTable />);
  const getRow = (name: string) => within(container).getByText(name).closest('[data-testid="data-table-row"]');
  return {
    container,
    getRow,
    isHighlighted: (name: string) => getRow(name)?.querySelector('[data-row-highlighted="true"]') !== null,
    queryRow: (name: string) => within(container).queryByText(name)
  };
};

describe('DataTableRowHighlight', () => {
  it('highlights a row without resetting the current page', () => {
    const { container, isHighlighted, queryRow } = renderTestTable();

    fireEvent.click(within(container).getByRole('button', { name: '2' }));
    fireEvent.click(within(container).getByText('Row 11'));

    expect(queryRow('Row 11')).not.toBeNull();
    expect(isHighlighted('Row 11')).toBe(true);
  });

  it('highlights only the most recently clicked row', () => {
    const { container, isHighlighted } = renderTestTable();

    fireEvent.click(within(container).getByText('Row 1'));
    expect(isHighlighted('Row 1')).toBe(true);
    expect(isHighlighted('Row 2')).toBe(false);

    fireEvent.click(within(container).getByText('Row 2'));
    expect(isHighlighted('Row 1')).toBe(false);
    expect(isHighlighted('Row 2')).toBe(true);
  });

  it('exposes the highlight color above the rows, so the css rule resolves', () => {
    const { container, getRow } = renderTestTable();

    const root = container.querySelector<HTMLElement>('[style*="--data-table-row-highlight-background"]');
    expect(root).not.toBeNull();
    expect(root!.contains(getRow('Row 1'))).toBe(true);
  });
});
