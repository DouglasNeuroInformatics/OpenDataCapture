import type { Language } from '@opendatacapture/schemas/core';

/**
 * The assignment link, opening the gateway in `language` unless the link already names one. The
 * gateway reads it from `?lang=`. A language chosen when the assignment was created is kept, so an
 * email written in another language cannot send the subject a link that differs from the copied one.
 */
export function withLinkLanguage(url: string, language: Language): string {
  const link = new URL(url);
  if (!link.searchParams.has('lang')) {
    link.searchParams.set('lang', language);
  }
  return link.href;
}
