import { isRedirect } from '@tanstack/react-router';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/group/email-templates';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  config: { setup: { isGatewayEnabled: true } }
}));

vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/components/GroupEmailTemplates', () => ({
  GroupEmailTemplates: () => <div data-testid="group-email-templates" />
}));

const runGuard = () => {
  const beforeLoad = Route.options.beforeLoad as () => void;
  try {
    beforeLoad();
  } catch (err) {
    return err;
  }
  return null;
};

beforeEach(() => {
  mocks.config.setup.isGatewayEnabled = true;
});

afterEach(cleanup);

describe('group email templates route guard', () => {
  it('should redirect to the dashboard when the gateway is not deployed, so a bookmarked link cannot reach a page whose endpoints are not mounted', () => {
    mocks.config.setup.isGatewayEnabled = false;
    const thrown = runGuard();
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/dashboard' } });
  });

  it('should allow the route when the gateway is deployed', () => {
    expect(runGuard()).toBeNull();
  });
});

describe('group email templates route', () => {
  it('should title the page and render the group email template manager beneath it', () => {
    const Component = Route.options.component!;
    render(<Component />);
    expect(screen.getByTestId('page-header').textContent).toBe('Email Templates');
    expect(screen.getByTestId('group-email-templates')).toBeTruthy();
  });
});
