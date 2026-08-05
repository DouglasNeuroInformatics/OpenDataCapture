import { useEffect } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';

import { toLanguageToggleOptions } from '../utils/language';

/**
 * The languages an instance offers, as options for libui's `LanguageToggle`.
 *
 * Deactivating a language would otherwise strand every user already reading in it: their strings
 * still resolve, but the toggle no longer lists it, so they have no way back. Reconciling here —
 * rather than where an admin flips the setting — moves whoever is affected on their next load,
 * not just the admin who made the change.
 */
export const useLanguageOptions = (activeLanguages: ActiveLanguages) => {
  const { changeLanguage, resolvedLanguage } = useTranslation();

  const isActive = activeLanguages.includes(resolvedLanguage);

  useEffect(() => {
    if (!isActive) {
      changeLanguage(activeLanguages[0]);
    }
  }, [isActive, activeLanguages]);

  return toLanguageToggleOptions(activeLanguages);
};
