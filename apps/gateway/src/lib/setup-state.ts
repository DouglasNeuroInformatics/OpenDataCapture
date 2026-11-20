import { $Language, DEFAULT_ACTIVE_LANGUAGES } from '@opendatacapture/schemas/core';
import type { ActiveLanguages, Language } from '@opendatacapture/schemas/core';
import type { RemoteSetupState } from '@opendatacapture/schemas/gateway';

/**
 * The languages an `Accept-Language` header asks for, most wanted first.
 *
 * Only the base language is kept, so `fr-CA` counts as a request for French, and a tag with `q=0`
 * is dropped because that is how a client says it does not want one. An unparseable quality is
 * treated as the default of 1 rather than discarded, since a client that sends one still wants the
 * language it named.
 */
const parseAcceptLanguage = (header: string): string[] => {
  return header
    .split(',')
    .map((part) => {
      const [tag = '', ...parameters] = part.trim().split(';');
      const quality = parameters
        .map((parameter) => /^\s*q=(?<value>[\d.]+)\s*$/u.exec(parameter)?.groups?.value)
        .find((value) => value !== undefined);
      return { quality: quality === undefined ? 1 : Number.parseFloat(quality) || 0, tag: tag.trim() };
    })
    .filter(({ quality, tag }) => tag.length > 0 && quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .map(({ tag }) => tag.split('-')[0]!.toLowerCase());
};

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
 * otherwise the first language the reader's browser asks for that the instance offers, and failing
 * both the first active language. Resolved server-side rather than from `window.location` or
 * `navigator` so the SSR pass and the hydration pass agree; anything else renders the page in one
 * language and then swaps it.
 *
 * A link created without a language is the common case — an assignment is assigned before anyone
 * knows what the subject reads — so the header is what makes that link open in their own language.
 */
export function resolveLanguage(requested: unknown, acceptLanguage?: string): Language {
  const activeLanguages = getActiveLanguages();
  const requestedLanguage = $Language.safeParse(requested);
  if (requestedLanguage.success && activeLanguages.includes(requestedLanguage.data)) {
    return requestedLanguage.data;
  }
  const accepted = parseAcceptLanguage(acceptLanguage ?? '')
    .map((tag) => $Language.safeParse(tag))
    .find((parsed) => parsed.success && activeLanguages.includes(parsed.data));
  return accepted?.success ? accepted.data : activeLanguages[0];
}

export function updateSetupState(state: RemoteSetupState): void {
  setupState = state;
}
