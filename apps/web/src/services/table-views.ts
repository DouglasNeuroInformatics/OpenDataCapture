import type { TanstackTable } from '@douglasneuroinformatics/libui/components';

export type TableView = {
  pageIndex: number;
  sorting: TanstackTable.SortingState;
};

/**
 * Where each client-mode `DataTable` was left, by table name. In memory only: signing out reloads
 * the app, which clears it, so one user's place in a list never carries over to the next user of
 * the browser. A test rendering the same table twice clears it between renders.
 */
export const savedTableViews = new Map<string, TableView>();
