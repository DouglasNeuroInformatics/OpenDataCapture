import { useSetupStateQuery } from './useSetupStateQuery';

/**
 * Whether this instance offers remote assignments at all. Two independent conditions: assignments are
 * served through the gateway, so it must be deployed, and an admin may opt out of the feature on an
 * instance that only collects data in person.
 */
export function useIsRemoteAssignmentsEnabled(): boolean {
  const setupStateQuery = useSetupStateQuery();
  return setupStateQuery.data.isGatewayEnabled && setupStateQuery.data.isRemoteAssignmentsEnabled;
}
