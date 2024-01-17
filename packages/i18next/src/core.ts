import { transformTranslations } from '@douglasneuroinformatics/ui';
import { createInstance } from 'i18next';

import core from './translations/core.json';

export const defaultNS = 'core';

const resources = {
  en: {
    core: transformTranslations(core, 'en')
  },
  fr: {
    core: transformTranslations(core, 'fr')
  }
} as const;

export const i18n = createInstance({
  defaultNS,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources,
  returnObjects: true,
  supportedLngs: ['en', 'fr']
});
