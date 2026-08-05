import { useEffect } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { resolveActiveLanguage } from '@opendatacapture/schemas/core';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';

import { toLanguageToggleOptions } from '../utils/language';

/**
 * The languages an instance offers, as options for libui's `LanguageToggle`.
 *
 * The effect covers an admin deactivating a language **during** a session: every component is
 * subscribed to `languageChange` by then, so they all re-render. It cannot cover a tree that
 * mounts already stranded — effects run child-first, so this fires before the ancestors rendering
 * the toggle have subscribed, and they would keep the deactivated language. A host resolves that
 * case before it renders (`apps/web` in the `_app` route's `beforeLoad`; `apps/gateway` picks the
 * language server-side from the same set), which is why this only has to handle the live change.
 */
export const useLanguageOptions = (activeLanguages: ActiveLanguages) => {
  const { changeLanguage, resolvedLanguage } = useTranslation();

  const reconciled = resolveActiveLanguage(resolvedLanguage, activeLanguages);

  useEffect(() => {
    if (reconciled !== resolvedLanguage) {
      changeLanguage(reconciled);
    }
  }, [reconciled, resolvedLanguage]);

  return toLanguageToggleOptions(activeLanguages);
};
