import { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react';

type SortableHeaderProps<TRow> = {
  column: TanstackTable.Column<TRow>;
  label: string;
  /**
   * The direction the rows were actually fetched in. Required for a table in server mode, which
   * mounts with no sorting state of its own, so the column reads as unsorted however it is ordered.
   */
  sortOrder?: 'asc' | 'desc';
};

const SORT_ICONS = { asc: ChevronUpIcon, desc: ChevronDownIcon };

/**
 * A clickable column label. `DataTableHead` renders whatever the column supplies, so the sort
 * affordance lives here rather than coming from the table.
 */
export const SortableHeader = <TRow,>({ column, label, sortOrder }: SortableHeaderProps<TRow>) => {
  const sorted = sortOrder ?? column.getIsSorted();
  const Icon = sorted ? SORT_ICONS[sorted] : ChevronsUpDownIcon;
  return (
    <button
      className="hover:text-foreground flex items-center gap-1 transition-colors"
      type="button"
      onClick={() => column.toggleSorting()}
    >
      {label}
      <Icon className={cn('h-3.5 w-3.5 shrink-0', !sorted && 'opacity-40')} />
    </button>
  );
};
