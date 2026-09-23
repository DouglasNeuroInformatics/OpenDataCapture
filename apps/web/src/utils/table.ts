import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

/**
 * The subject ids currently listed by the table, for filtering an export down to them.
 *
 * Read one per row: iterating `getVisibleCells()` yields the row's id once per rendered column
 * (including the row-actions column), so the ids arrive duplicated as many times as there are
 * columns. A set also keeps the membership test that consumes this constant time rather than a
 * linear scan per exported row.
 */
export function getListedSubjectIds(table: TanstackTable.Table<Subject>): Set<string> {
  return new Set(table.getPrePaginationRowModel().rows.map((row) => removeSubjectIdScope(row.original.id)));
}
