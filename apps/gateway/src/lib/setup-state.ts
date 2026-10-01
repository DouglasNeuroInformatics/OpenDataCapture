import { $Language, DEFAULT_ACTIVE_LANGUAGES, resolveActiveLanguage } from '@opendatacapture/schemas/core';
import type { ActiveLanguages, Language } from '@opendatacapture/schemas/core';
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

/**
 * The language to render a page in: the one a `?lang=` query asks for when the instance offers it,
 * otherwise the first active language. Resolved server-side rather than from `window.location` so
 * the SSR pass and the hydration pass agree; anything else renders the page in English and then
 * swaps it.
 */
export function resolveLanguage(requested: unknown): Language {
  const activeLanguages = getActiveLanguages();
  const requestedLanguage = $Language.safeParse(requested);
  return requestedLanguage.success
    ? resolveActiveLanguage(requestedLanguage.data, activeLanguages)
    : activeLanguages[0];
}

export function updateSetupState(state: RemoteSetupState): void {
  setupState = state;
}
