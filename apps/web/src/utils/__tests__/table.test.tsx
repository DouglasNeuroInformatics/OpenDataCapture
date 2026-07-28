import React from 'react';

import { DataTable } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import type { Subject } from '@opendatacapture/schemas/subject';
import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { getListedSubjectIds } from '@/utils/table';

// Initialises the shared libui translator, which the table's controls read on render.
import '@/services/i18n';

const noop = () => undefined;

/** A complete `Subject`, so the fixture satisfies the type rather than being cast into it. */
const subject = (id: string): Subject => ({
  createdAt: new Date(0),
  dateOfBirth: null,
  firstName: null,
  groupIds: [],
  id,
  lastName: null,
  sessionIds: [],
  sex: null,
  updatedAt: new Date(0)
});

/**
 * Renders a table shaped like the datahub master table (several columns plus row actions) and hands
 * back its tanstack instance, so the id extraction is exercised against a real row model rather than
 * a hand-built stand-in.
 */
const renderMasterTableLike = (ids: string[]) => {
  let table: TanstackTable.Table<Subject> | undefined;
  const Capture = (props: { table: TanstackTable.Table<Subject> }) => {
    table = props.table;
    return null;
  };
  render(
    <DataTable<Subject>
      columns={[
        { accessorFn: (subject) => subject.id, header: 'Subject', id: 'subjectId' },
        { accessorFn: () => null, header: 'DOB', id: 'dateOfBirth' },
        { accessorFn: () => null, header: 'Sex', id: 'sex' }
      ]}
      data={ids.map(subject)}
      rowActions={[{ label: 'View', onSelect: noop }]}
      togglesComponent={Capture}
    />
  );
  if (!table) {
    throw new Error('DataTable did not invoke togglesComponent, so no tanstack table was captured');
  }
  return table;
};

describe('getListedSubjectIds', () => {
  beforeAll(() => {
    // libui measures the table container; happy-dom has no layout engine.
    globalThis.ResizeObserver ??= class {
      disconnect = noop;
      observe = noop;
      unobserve = noop;
    } as never;
  });

  it('should yield one id per row, not the one-per-rendered-cell duplication the row model offers', () => {
    const table = renderMasterTableLike(['subject-a', 'subject-b', 'subject-c']);
    const rows = table.getPrePaginationRowModel().rows;

    // Asserts the duplication the previous implementation hit is real rather than assumed:
    // `getVisibleCells()` repeats the row's id once per column, including the row-actions column.
    const perCell = rows.flatMap((row) => row.getVisibleCells().map((cell) => cell.row.original.id));
    expect(perCell.length).toBeGreaterThan(rows.length);

    expect([...getListedSubjectIds(table)]).toStrictEqual(['subject-a', 'subject-b', 'subject-c']);
  });

  it('should strip the group scope, so the ids match the unscoped subject ids an export carries', () => {
    const table = renderMasterTableLike(['Group_A$subject-a', 'Group_A$subject-b']);

    expect([...getListedSubjectIds(table)]).toStrictEqual(['subject-a', 'subject-b']);
  });

  it('should return an empty set when the table lists no subjects, so nothing is exported', () => {
    expect(getListedSubjectIds(renderMasterTableLike([])).size).toBe(0);
  });
});
