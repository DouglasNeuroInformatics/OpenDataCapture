import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

const DataTableRowHighlightContext = createContext<null | string>(null);

export const dataTableRowHighlightRootStyle = {
  '--data-table-row-highlight-background': 'var(--color-accent)'
};

export const DataTableRowHighlightProvider = ({ children, rowId }: PropsWithChildren<{ rowId: null | string }>) => (
  <DataTableRowHighlightContext value={rowId}>{children}</DataTableRowHighlightContext>
);

export const DataTableRowHighlight = ({ rowId }: { rowId: string }) => {
  const highlightedRowId = useContext(DataTableRowHighlightContext);

  return <span className="hidden" data-row-highlighted={highlightedRowId === rowId} />;
};
