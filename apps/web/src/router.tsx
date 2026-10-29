/* eslint-disable @typescript-eslint/consistent-type-definitions -- Register and HistoryState are augmented by declaration merging into TanStack Router's interfaces, which a type alias cannot do */

import { createRouter } from '@tanstack/react-router';

import { AppErrorComponent } from './components/AppErrorComponent';
import { LoadingFallback } from './components/LoadingFallback';
import { routeTree } from './route-tree';
import { queryClient } from './services/react-query';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    [key: string]: unknown;
  }
}

export const router = createRouter({
  context: {
    queryClient
  },
  defaultErrorComponent: AppErrorComponent,
  defaultPendingComponent: LoadingFallback,
  defaultPendingMinMs: 500,
  routeTree
});
