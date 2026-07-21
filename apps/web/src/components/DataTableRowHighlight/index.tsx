import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import type { DataTableRootStyle } from '@douglasneuroinformatics/libui/components';

const DataTableRowHighlightContext = createContext<null | string>(null);

/**
 * Mixing into `--color-background` keeps the highlight legible in both light and dark mode. It must not
 * reuse `--color-accent`, which libui already uses for the row hover state, or a hovered row and the
 * highlighted row become indistinguishable.
 */
export const dataTableRowHighlightRootStyle: DataTableRootStyle = {
  '--data-table-row-highlight-background': 'color-mix(in oklab, var(--color-sky-500) 18%, var(--color-background))'
};

/**
 * Publishes the highlighted row id to the markers below it.
 *
 * The id travels by context rather than as a `DataTable` prop because re-rendering a `DataTable` discards
 * its pagination, sorting, global filter and column sizing: libui reruns `store.reset(props)` on every
 * render (the effect's dependency is a fresh rest-spread object) and `reset` rebuilds the whole Tanstack
 * state from defaults. Call sites therefore memoize the `DataTable` element itself and let only the markers
 * re-render — so keep those memo dependency lists free of anything that changes while the table is in use.
 */
export const DataTableRowHighlightProvider = ({ children, rowId }: PropsWithChildren<{ rowId: null | string }>) => (
  <DataTableRowHighlightContext value={rowId}>{children}</DataTableRowHighlightContext>
);

/**
 * Flags the row it is rendered in as highlighted. libui does not expose a per-row class name, so the flag is
 * emitted as an attribute for the `:has()` rule in `styles.css` to match on.
 */
export const DataTableRowHighlight = ({ rowId }: { rowId: string }) => {
  const highlightedRowId = useContext(DataTableRowHighlightContext);

  return <span className="hidden" data-row-highlighted={highlightedRowId === rowId} />;
};
