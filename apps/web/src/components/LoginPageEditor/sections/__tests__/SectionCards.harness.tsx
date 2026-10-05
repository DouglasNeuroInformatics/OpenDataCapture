import type React from 'react';

import type { BrandingConfig, SetupState } from '@opendatacapture/schemas/setup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider
} from '@tanstack/react-router';
import { act, render } from '@testing-library/react';

import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';

import { useBrandingForm } from '../../hooks';

import type { BrandingEditor } from '../../hooks';

/** Rendered on the route the editor navigates to, so a test can tell the navigation went through. */
const DESTINATION_TEXT = 'Elsewhere';

const EditorHost = ({ children }: { children: (editor: BrandingEditor) => React.ReactNode }) => {
  return <>{children(useBrandingForm())}</>;
};

/**
 * Renders `children` against a real `useBrandingForm` editor: the saved branding is seeded into a
 * real query client and the editor sits on the `/` route of a real memory router, so its
 * unsaved-changes blocker engages for real when the test navigates to `/elsewhere`.
 */
async function renderWithBrandingEditor(
  children: (editor: BrandingEditor) => React.ReactNode,
  branding: BrandingConfig | null = null
) {
  const setupState: SetupState = {
    activeLanguages: ['en', 'fr'],
    branding,
    isDemo: false,
    isGatewayEnabled: false,
    isSetup: true,
    release: { buildTime: 0, type: 'production', version: '1.0.0' },
    uptime: 0
  };
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  queryClient.setQueryData(setupStateQueryOptions().queryKey, setupState);
  const rootRoute = createRootRoute({ component: Outlet });
  const routeTree = rootRoute.addChildren([
    createRoute({
      component: () => <EditorHost>{children}</EditorHost>,
      getParentRoute: () => rootRoute,
      path: '/'
    }),
    createRoute({ component: () => <p>{DESTINATION_TEXT}</p>, getParentRoute: () => rootRoute, path: '/elsewhere' })
  ]);
  const router = createRouter({ history: createMemoryHistory({ initialEntries: ['/'] }), routeTree });
  await act(() => router.load());
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return { router };
}

export { DESTINATION_TEXT, renderWithBrandingEditor };
