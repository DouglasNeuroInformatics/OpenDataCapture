import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import type { Subject } from '@opendatacapture/schemas/subject';

/**
 * The scoped subject ids currently listed by the table, for scoping a server-side export to them.
 *
 * Read one per row: iterating `getVisibleCells()` yields the row's id once per rendered column
 * (including the row-actions column), so the ids arrive duplicated as many times as there are
 * columns.
 */
export function getListedSubjectIds(table: TanstackTable.Table<Subject>): Set<string> {
  return new Set(table.getPrePaginationRowModel().rows.map((row) => row.original.id));
}
