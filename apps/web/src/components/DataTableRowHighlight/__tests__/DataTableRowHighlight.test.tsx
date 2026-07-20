import { useMemo, useState } from 'react';

import { DataTable } from '@douglasneuroinformatics/libui/components';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTableRowHighlight, DataTableRowHighlightProvider } from '..';

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
        onRowClick={(row) => setHighlightedRowId(row.id)}
      />
    ),
    []
  );

  return <DataTableRowHighlightProvider rowId={highlightedRowId}>{dataTable}</DataTableRowHighlightProvider>;
};

describe('DataTableRowHighlight', () => {
  it('highlights a row without resetting the current page', () => {
    render(<TestTable />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByText('Row 11'));

    const row = screen.getByText('Row 11').closest('[data-testid="data-table-row"]');
    expect(row?.querySelector('[data-row-highlighted="true"]')).not.toBeNull();
  });
});
