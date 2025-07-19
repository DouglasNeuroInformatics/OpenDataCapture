/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { ErrorPage } from '@opendatacapture/react-core';
import { createRouter } from '@tanstack/react-router';

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
  defaultErrorComponent: ErrorPage,
  defaultPendingComponent: LoadingFallback,
  defaultPendingMinMs: 500,
  routeTree
});
