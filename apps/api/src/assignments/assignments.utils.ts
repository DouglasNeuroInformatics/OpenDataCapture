import type { Language } from '@opendatacapture/schemas/core';

/**
 * The assignment link, opening the gateway in `language`, which it reads from `?lang=`.
 *
 * Set only when the assignment is created: a link left without a language is one the subject's own
 * browser decides, and nothing later — an email written in another language included — overrides
 * that.
 */
export function withLinkLanguage(url: string, language: Language): string {
  const link = new URL(url);
  link.searchParams.set('lang', language);
  return link.href;
}
