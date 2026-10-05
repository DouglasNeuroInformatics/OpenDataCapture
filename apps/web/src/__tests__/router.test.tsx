import { describe, expect, it, vi } from 'vitest';

import { AppErrorComponent } from '@/components/AppErrorComponent';
import { LoadingFallback } from '@/components/LoadingFallback';
import { router } from '@/router';
import { queryClient } from '@/services/react-query';

const mocks = vi.hoisted(() => ({ routeTree: {} }));

vi.mock('@/route-tree', async () => {
  const { createRootRoute } = await import('@tanstack/react-router');
  mocks.routeTree = createRootRoute();
  return { routeTree: mocks.routeTree };
});

describe('router', () => {
  it('should route through the generated route tree', () => {
    expect(router.routeTree).toBe(mocks.routeTree);
  });

  it('should hand every loader the shared query client, so loaders prefetch into the cache components read', () => {
    expect(router.options.context?.queryClient).toBe(queryClient);
  });

  it('should render the app error component for a route without its own error component', () => {
    expect(router.options.defaultErrorComponent).toBe(AppErrorComponent);
  });

  it('should show the loading fallback for at least half a second, so a fast load does not flash it', () => {
    expect(router.options.defaultPendingComponent).toBe(LoadingFallback);
    expect(router.options.defaultPendingMinMs).toBe(500);
  });
});
