import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ConnectivityBanner } from '../components/ConnectivityBanner';
import { InactivityWarning } from '../components/InactivityWarning';
import { ReauthenticationDialog } from '../components/ReauthenticationDialog';
import { localizeValidationErrors } from '../services/zod';

import '../services/axios';
import '../services/i18n';
import '../services/token-renewal';

localizeValidationErrors().catch(console.error);

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <CoreProvider>
      <ConnectivityBanner />
      <InactivityWarning />
      <ReauthenticationDialog />
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" position="left" />
      <TanStackRouterDevtools />
    </CoreProvider>
  )
});
