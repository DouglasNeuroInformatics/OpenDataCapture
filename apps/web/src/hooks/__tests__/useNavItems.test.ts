import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentSession, currentUser } from '@/testing/stubs';

import { useNavItems } from '../useNavItems';

import '@/services/i18n';

// Both mock factories only read these when a hook renders, so they may be declared here rather than
// hoisted — and `currentUser` is an import, which `vi.hoisted` cannot reach.
const store = { currentGroup: null, currentSession, currentUser };
const setupState = {
  data: { isExperimentalFeaturesEnabled: false, isGatewayEnabled: true, isRemoteAssignmentsEnabled: true }
};

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(store))
}));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => setupState
}));

const navUrls = () =>
  renderHook(() => useNavItems())
    .result.current.flat()
    .map((item) => item.url);

describe('useNavItems', () => {
  beforeEach(() => {
    setupState.data = {
      isExperimentalFeaturesEnabled: false,
      isGatewayEnabled: true,
      isRemoteAssignmentsEnabled: true
    };
  });

  it('should offer remote assignment when the gateway and the feature are both on', () => {
    expect(navUrls()).toContain('/session/remote-assignment');
  });

  // An instance that only collects data in person turns the feature off, and nothing about remote
  // assignment should remain reachable from the sidebar.
  it('should hide remote assignment once an admin disables the feature', () => {
    setupState.data.isRemoteAssignmentsEnabled = false;
    expect(navUrls()).not.toContain('/session/remote-assignment');
  });

  it('should hide remote assignment when the gateway is off, even with the feature enabled', () => {
    setupState.data.isGatewayEnabled = false;
    expect(navUrls()).not.toContain('/session/remote-assignment');
  });
});
