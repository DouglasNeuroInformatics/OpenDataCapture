import { Fragment } from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import '../services/axios';
import '../services/i18n';
import '../services/zod';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Fragment>
      <Outlet />
      <NotificationHub />
      <ReactQueryDevtools buttonPosition="bottom-right" position="left" />
      <TanStackRouterDevtools />
    </Fragment>
  )
});
