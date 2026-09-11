import { isRedirect } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  config: { setup: { apiBaseUrl: '', isGatewayEnabled: true } }
}));

vi.mock('@/config', () => ({ config: mocks.config }));

/**
 * Every route whose page exists only to serve remote assignments, which the API mounts behind
 * GATEWAY_ENABLED. Each entry is the module holding the route and where its guard sends a user
 * whose instance was deployed without the gateway.
 */
const GATEWAY_ROUTES = [
  {
    importRoute: async () => (await import('@/routes/_app/session/remote-assignment')).Route,
    params: {},
    redirectsTo: '/dashboard'
  },
  {
    importRoute: async () => (await import('@/routes/_app/datahub/$subjectId/assignments')).Route,
    params: { subjectId: '123' },
    redirectsTo: '/datahub/$subjectId/table'
  },
  {
    importRoute: async () => (await import('@/routes/_app/group/email-templates')).Route,
    params: {},
    redirectsTo: '/dashboard'
  },
  {
    importRoute: async () => (await import('@/routes/_app/group/bulk-remote-assignments')).Route,
    params: {},
    redirectsTo: '/dashboard'
  }
] as const;

/**
 * Awaited, because a guard that has to consult setup state is async — a redirect it throws arrives
 * as a rejection rather than synchronously. Guards that stay synchronous are unaffected.
 */
const runGuard = async (
  route: { options: { beforeLoad?: unknown } },
  params: object,
  setupState: { isBulkRemoteAssignmentsEnabled?: boolean } = { isBulkRemoteAssignmentsEnabled: true }
) => {
  const beforeLoad = route.options.beforeLoad as (opts: {
    context: { queryClient: { ensureQueryData: () => Promise<unknown> } };
    params: object;
  }) => Promise<void> | void;
  try {
    await beforeLoad({
      context: { queryClient: { ensureQueryData: () => Promise.resolve(setupState) } },
      params
    });
  } catch (err) {
    return err;
  }
  return null;
};

beforeEach(() => {
  mocks.config.setup.isGatewayEnabled = true;
});

describe.each(GATEWAY_ROUTES)('$redirectsTo guard', ({ importRoute, params, redirectsTo }) => {
  it('should redirect away when the gateway is not deployed, so a bookmarked link cannot reach a page whose endpoints are not mounted', async () => {
    mocks.config.setup.isGatewayEnabled = false;
    const thrown = await runGuard(await importRoute(), params);
    expect(isRedirect(thrown)).toBe(true);
    expect((thrown as { options: { to: string } }).options.to).toBe(redirectsTo);
  });

  it('should allow the route when the gateway is deployed', async () => {
    expect(await runGuard(await importRoute(), params)).toBeNull();
  });
});

describe('bulk remote assignments guard', () => {
  const importRoute = async () => (await import('@/routes/_app/group/bulk-remote-assignments')).Route;

  // Hiding the nav link is not enough: the page must not be reachable by url when an admin has
  // turned the feature off.
  it('should redirect away when the instance toggle is off', async () => {
    const thrown = await runGuard(await importRoute(), {}, { isBulkRemoteAssignmentsEnabled: false });
    expect(isRedirect(thrown)).toBe(true);
    expect((thrown as { options: { to: string } }).options.to).toBe('/dashboard');
  });

  it('should allow the route when the toggle is on and the gateway is deployed', async () => {
    expect(await runGuard(await importRoute(), {}, { isBulkRemoteAssignmentsEnabled: true })).toBeNull();
  });
});
