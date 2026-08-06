import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIsRemoteAssignmentsEnabled } from '../useIsRemoteAssignmentsEnabled';

const setupState = { data: { isGatewayEnabled: true, isRemoteAssignmentsEnabled: true } };

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => setupState
}));

describe('useIsRemoteAssignmentsEnabled', () => {
  it.each([
    { expected: true, isGatewayEnabled: true, isRemoteAssignmentsEnabled: true },
    { expected: false, isGatewayEnabled: true, isRemoteAssignmentsEnabled: false },
    { expected: false, isGatewayEnabled: false, isRemoteAssignmentsEnabled: true },
    { expected: false, isGatewayEnabled: false, isRemoteAssignmentsEnabled: false }
  ])(
    'should be $expected when the gateway is $isGatewayEnabled and the feature is $isRemoteAssignmentsEnabled',
    ({ expected, isGatewayEnabled, isRemoteAssignmentsEnabled }) => {
      setupState.data = { isGatewayEnabled, isRemoteAssignmentsEnabled };
      expect(renderHook(() => useIsRemoteAssignmentsEnabled()).result.current).toBe(expected);
    }
  );
});
