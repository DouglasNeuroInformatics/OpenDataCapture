import { cleanup, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNavItems } from '../useNavItems';

import type { NavItem } from '../useNavItems';

import '@/services/i18n';

const mocks = vi.hoisted(() => {
  const can = vi.fn((_action: string, _subject: string) => true);
  return {
    can,
    config: { setup: { isGatewayEnabled: true } },
    setupState: { isBulkRemoteAssignmentsEnabled: true, isExperimentalFeaturesEnabled: false, isMailEnabled: false },
    store: { currentGroup: { id: 'group-1' }, currentSession: null, currentUser: { ability: { can } } }
  };
});

vi.mock('@/config', () => ({ config: mocks.config }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(mocks.store))
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: mocks.setupState })
}));

/** Every reachable url, including those nested inside a collapsible group. */
const navUrls = () => {
  const collect = (items: NavItem[]): (string | undefined)[] =>
    items.flatMap((item) => [item.url, ...collect(item.children ?? [])]);
  return collect(renderHook(() => useNavItems()).result.current.flat());
};

const navLabels = () =>
  renderHook(() => useNavItems())
    .result.current.flat()
    .map((item) => item.label);

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
  mocks.can.mockReturnValue(true);
  mocks.config.setup.isGatewayEnabled = true;
  mocks.setupState.isMailEnabled = false;
  mocks.setupState.isBulkRemoteAssignmentsEnabled = true;
});

describe('useNavItems', () => {
  it('should offer remote assignment when the gateway is deployed', () => {
    expect(navUrls()).toContain('/session/remote-assignment');
  });

  // Assignments are served through the gateway, and the API only loads AssignmentsModule when
  // GATEWAY_ENABLED, so an instance without it must not advertise a page that cannot work.
  it('should omit remote assignment when the gateway is not deployed', () => {
    mocks.config.setup.isGatewayEnabled = false;
    expect(navUrls()).not.toContain('/session/remote-assignment');
  });

  it('should omit remote assignment when the user cannot create one', () => {
    mocks.can.mockImplementation((action, subject) => !(action === 'create' && subject === 'Assignment'));
    expect(navUrls()).not.toContain('/session/remote-assignment');
  });

  it('should offer email templates when mail is configured and the gateway is deployed', () => {
    mocks.setupState.isMailEnabled = true;
    expect(navUrls()).toContain('/group/email-templates');
  });

  // The templates are only ever used to email a remote assignment link, and the endpoint that sends
  // that mail lives in the gateway-gated AssignmentsModule.
  it('should omit email templates when the gateway is not deployed, even with mail configured', () => {
    mocks.setupState.isMailEnabled = true;
    mocks.config.setup.isGatewayEnabled = false;
    expect(navUrls()).not.toContain('/group/email-templates');
  });

  it('should group the group-scoped pages under a single parent', () => {
    expect(navLabels()).toContain('Group Actions');
  });

  it('should offer bulk remote assignments to a user holding the abilities that page needs', () => {
    expect(navUrls()).toContain('/group/bulk-remote-assignments');
  });

  it('should omit bulk remote assignments when the gateway is not deployed', () => {
    mocks.config.setup.isGatewayEnabled = false;
    expect(navUrls()).not.toContain('/group/bulk-remote-assignments');
  });

  it('should omit bulk remote assignments when the user cannot create an assignment', () => {
    mocks.can.mockImplementation((action, subject) => !(action === 'create' && subject === 'Assignment'));
    expect(navUrls()).not.toContain('/group/bulk-remote-assignments');
  });

  // Each child is gated on its own requirements: losing assignment-create must not take the
  // existing manage-group link down with it.
  it('should keep manage group available to a user who cannot create assignments', () => {
    mocks.can.mockImplementation((action, subject) => !(action === 'create' && subject === 'Assignment'));
    expect(navUrls()).toContain('/group/manage');
    expect(navUrls()).not.toContain('/group/bulk-remote-assignments');
  });

  // With the instance toggle off, the group links must stay exactly where they were, so an
  // instance that never enables this sees no change to its menu at all.
  it('should leave the group links flat and hide the bulk page when the toggle is off', () => {
    mocks.setupState.isBulkRemoteAssignmentsEnabled = false;
    expect(navUrls()).toContain('/group/manage');
    expect(navUrls()).not.toContain('/group/bulk-remote-assignments');
    expect(navLabels()).not.toContain('Group Actions');
  });

  it('should keep email templates flat and reachable when the toggle is off', () => {
    mocks.setupState.isBulkRemoteAssignmentsEnabled = false;
    mocks.setupState.isMailEnabled = true;
    expect(navUrls()).toContain('/group/email-templates');
    expect(navLabels()).not.toContain('Group Actions');
  });

  it('should still render the group when only bulk assignments is available', () => {
    mocks.can.mockImplementation((action, subject) => !(action === 'manage' && subject === 'Group'));
    expect(navUrls()).toContain('/group/bulk-remote-assignments');
    expect(navUrls()).not.toContain('/group/manage');
    expect(navLabels()).toContain('Group Actions');
  });
});
