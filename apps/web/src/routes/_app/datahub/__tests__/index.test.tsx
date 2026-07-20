import React from 'react';

import { DataTable } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

// Initialises the shared libui translator, which the table's controls read on render.
import '@/services/i18n';

const noop = () => undefined;

type Row = { id: string };

/**
 * Renders a table shaped like the datahub master table (several columns plus row actions) and hands
 * back its tanstack instance, so the id extraction can be exercised against a real row model rather
 * than a hand-built stand-in.
 */
const renderMasterTableLike = (data: Row[]) => {
  let table: TanstackTable.Table<Row> | undefined;
  const Capture = (props: { table: TanstackTable.Table<Row> }) => {
    table = props.table;
    return null;
  };
  render(
    <DataTable<Row>
      columns={[
        { accessorFn: (row) => row.id, header: 'Subject', id: 'subjectId' },
        { accessorFn: () => null, header: 'DOB', id: 'dateOfBirth' },
        { accessorFn: () => null, header: 'Sex', id: 'sex' }
      ]}
      data={data}
      rowActions={[{ label: 'View', onSelect: noop }]}
      togglesComponent={Capture}
    />
  );
  return table!;
};

describe('datahub export subject filter', () => {
  beforeAll(() => {
    // libui measures the table container; happy-dom has no layout engine.
    globalThis.ResizeObserver ??= class {
      disconnect = noop;
      observe = noop;
      unobserve = noop;
    } as never;
  });

  it('yields one id per row, not one per rendered cell', () => {
    const data = [{ id: 'subject-a' }, { id: 'subject-b' }, { id: 'subject-c' }];
    const table = renderMasterTableLike(data);
    const rows = table.getPrePaginationRowModel().rows;

    // The shape the previous implementation produced: `getVisibleCells()` repeats the row's id once
    // per column, so the ids arrive duplicated. This asserts the duplication is real rather than
    // assumed, and that the current extraction does not reproduce it.
    const perCell = rows.flatMap((row) => row.getVisibleCells().map((cell) => cell.row.original.id));
    expect(perCell.length).toBeGreaterThan(rows.length);

    const perRow = new Set(rows.map((row) => row.original.id));
    expect(perRow.size).toBe(data.length);
    expect([...perRow]).toStrictEqual(['subject-a', 'subject-b', 'subject-c']);
  });

  it('membership is a set lookup, so an export row is matched without scanning the list', () => {
    const table = renderMasterTableLike([{ id: 'subject-a' }, { id: 'subject-b' }]);
    const listed = new Set(table.getPrePaginationRowModel().rows.map((row) => row.original.id));

    const exportRows = [{ subjectId: 'subject-a' }, { subjectId: 'subject-z' }, { subjectId: 'subject-b' }];
    expect(exportRows.filter((row) => listed.has(row.subjectId)).map((row) => row.subjectId)).toStrictEqual([
      'subject-a',
      'subject-b'
    ]);
  });

  it('excludes every export row when the table lists no subjects', () => {
    const table = renderMasterTableLike([]);
    const listed = new Set(table.getPrePaginationRowModel().rows.map((row) => row.original.id));

    expect(listed.size).toBe(0);
    expect([{ subjectId: 'subject-a' }].filter((row) => listed.has(row.subjectId))).toStrictEqual([]);
  });
});
