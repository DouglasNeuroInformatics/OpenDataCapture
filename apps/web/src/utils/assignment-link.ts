import { $Language } from '@opendatacapture/schemas/core';
import type { Language } from '@opendatacapture/schemas/core';

/**
 * The language an assignment link opens the gateway in, which the API stores as its `lang` param.
 *
 * Absent for a link created without one — a bulk assignment, or one made before the language could
 * be chosen — which the gateway opens in its own choice of language instead.
 */
export function getLinkLanguage(url: string): Language | undefined {
  const lang = $Language.safeParse(new URL(url).searchParams.get('lang'));
  return lang.success ? lang.data : undefined;
}
