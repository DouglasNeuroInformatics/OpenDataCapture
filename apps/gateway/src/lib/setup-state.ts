import { DEFAULT_ACTIVE_LANGUAGES } from '@opendatacapture/schemas/core';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import type { RemoteSetupState } from '@opendatacapture/schemas/gateway';

/**
 * The setup state of the instance this gateway serves, as last pushed by `apps/api`.
 *
 * Held in memory, consistent with the verification set in `assignment-verification.ts`. It is a
 * copy of state the API owns rather than a record of anything that happens here, and the API
 * re-sends it every `GATEWAY_REFRESH_INTERVAL`, so a restart costs at most one interval on the
 * defaults below.
 */
let setupState: null | RemoteSetupState = null;

export function getActiveLanguages(): ActiveLanguages {
  return setupState?.activeLanguages ?? DEFAULT_ACTIVE_LANGUAGES;
}

export function updateSetupState(state: RemoteSetupState): void {
  setupState = state;
}
