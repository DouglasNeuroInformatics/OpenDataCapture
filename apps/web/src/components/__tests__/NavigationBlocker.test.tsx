import {
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider
} from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NavigationBlocker } from '@/components/NavigationBlocker';

import '@/services/i18n';

// Test scaffolding rather than copy, so it is not translated -- `jsx-no-literals` still applies here.
const DESTINATION_TEXT = 'Elsewhere';

let history: RouterHistory;

async function renderBlocker(active: boolean) {
  const rootRoute = createRootRoute({ component: Outlet });
  const routeTree = rootRoute.addChildren([
    createRoute({
      component: () => <NavigationBlocker active={active} message="Leave this instrument?" />,
      getParentRoute: () => rootRoute,
      path: '/'
    }),
    createRoute({ component: () => <p>{DESTINATION_TEXT}</p>, getParentRoute: () => rootRoute, path: '/elsewhere' })
  ]);
  const router = createRouter({ history, routeTree });
  await act(() => router.load());
  render(<RouterProvider router={router} />);
}

function dispatchBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('NavigationBlocker', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    history = createBrowserHistory();
  });

  afterEach(() => {
    cleanup();
    history.destroy();
  });

  it('should let the page unload while inactive, so a refresh after submitting does not prompt', async () => {
    await renderBlocker(false);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('should hold a page unload while active, so closing the tab mid-instrument prompts first', async () => {
    await renderBlocker(true);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('should keep the user in place when they decline to leave', async () => {
    await renderBlocker(true);
    act(() => history.push('/elsewhere'));
    await screen.findByTestId('blocker-dialog');
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    await act(() => Promise.resolve());
    expect(window.location.pathname).toBe('/');
  });

  it('should complete the navigation once the user confirms leaving', async () => {
    await renderBlocker(true);
    act(() => history.push('/elsewhere'));
    await screen.findByTestId('blocker-dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(await screen.findByText(DESTINATION_TEXT)).toBeTruthy();
  });
});
