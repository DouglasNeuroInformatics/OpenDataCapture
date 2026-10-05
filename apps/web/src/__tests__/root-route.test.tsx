import { QueryClient } from '@tanstack/react-query';
import { createMemoryHistory, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/__root';

// Test scaffolding rather than copy, so it is not translated -- `jsx-no-literals` still applies here.
const PAGE_TEXT = 'Index Page';

const mocks = vi.hoisted(() => ({
  localizeValidationErrors: vi.fn(() => Promise.resolve())
}));

vi.mock('@/components/ConnectivityBanner', () => ({
  ConnectivityBanner: () => <div data-testid="connectivity-banner" />
}));
vi.mock('@/services/zod', () => ({
  localizeValidationErrors: mocks.localizeValidationErrors
}));

const renderRootRoute = () => {
  const indexRoute = createRoute({
    component: () => <p>{PAGE_TEXT}</p>,
    getParentRoute: () => Route,
    path: '/'
  });
  const router = createRouter({
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory(),
    routeTree: Route.addChildren([indexRoute])
  });
  render(<RouterProvider router={router} />);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('root route', () => {
  it('should render the matched child route', async () => {
    renderRootRoute();
    expect(await screen.findByText(PAGE_TEXT)).toBeTruthy();
  });

  it('should render the connectivity banner above every page', async () => {
    renderRootRoute();
    expect(await screen.findByTestId('connectivity-banner')).toBeTruthy();
  });

  it('should localize validation errors as soon as the app loads', () => {
    expect(mocks.localizeValidationErrors).toHaveBeenCalledOnce();
  });

  it('should log a failure to localize validation errors rather than crash the app', async () => {
    const error = new Error('Failed to load translations');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.localizeValidationErrors.mockRejectedValueOnce(error);
    vi.resetModules();
    // The translator and axios interceptors are process-wide singletons, which a second import would set up twice.
    vi.doMock('@/services/i18n', () => ({}));
    vi.doMock('@/services/axios', () => ({}));
    await import('@/routes/__root');
    await waitFor(() => expect(consoleError).toHaveBeenCalledWith(error));
  });
});
