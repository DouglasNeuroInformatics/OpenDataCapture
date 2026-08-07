import { cleanup, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNavItems } from '../useNavItems';

import '@/services/i18n';

const mocks = vi.hoisted(() => {
  const can = vi.fn((_action: string, _subject: string) => true);
  return {
    can,
    config: { setup: { isGatewayEnabled: true } },
    store: { currentGroup: null, currentSession: null, currentUser: { ability: { can } } }
  };
});

vi.mock('@/config', () => ({ config: mocks.config }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(mocks.store))
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { isExperimentalFeaturesEnabled: false, isMailEnabled: false } })
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
});
