import { cleanup, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNavItems } from '../useNavItems';

import '@/services/i18n';

const mocks = vi.hoisted(() => {
  const can = vi.fn((_action: string, _subject: string) => true);
  return {
    can,
    config: { setup: { isGatewayEnabled: true } },
    setupState: { isExperimentalFeaturesEnabled: false, isMailEnabled: false },
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

const navUrls = () =>
  renderHook(() => useNavItems())
    .result.current.flat()
    .map((item) => item.url);

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
  vi.clearAllMocks();
  mocks.can.mockReturnValue(true);
  mocks.config.setup.isGatewayEnabled = true;
  mocks.setupState.isMailEnabled = false;
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
});
