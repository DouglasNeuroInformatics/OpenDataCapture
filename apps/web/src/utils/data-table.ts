/**
 * Keeps a libui `DataTable` body at least five rows tall, so a table holding one or two rows does not
 * collapse to a sliver. A row holding a button is 41px: a 24px control, 16px of padding, a 1px rule.
 * libui exposes no prop for this, so the class reaches its body through the `data-testid` it renders.
 */
export const MIN_TABLE_BODY_HEIGHT = '[&_[data-testid=data-table-body]]:min-h-[205px]';

/**
 * The one column a server-mode table's sorting state names, narrowed to the columns the endpoint can
 * order by. libui disables sort removal, so a change always names a column; any other state is a
 * column declared sortable that the endpoint does not know.
 */
export function readServerSort<TSortBy extends string>(
  state: { desc: boolean; id: string }[],
  sortableColumns: readonly TSortBy[]
): { sortBy: TSortBy; sortOrder: 'asc' | 'desc' } {
  for (const { desc, id } of state) {
    const sortBy = sortableColumns.find((column) => column === id);
    if (sortBy) {
      return { sortBy, sortOrder: desc ? 'desc' : 'asc' };
    }
  }
  throw new Error(`Cannot sort server-mode table by: ${JSON.stringify(state)}`);
}
