import { transformTranslations } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { EmptyObject, ValueOf } from 'type-fest';

import core from '../translations/core.json';

type TranslatedResource<T = EmptyObject> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? T[K] extends Record<Language, unknown>
      ? ValueOf<T[K]>
      : TranslatedResource<T[K]>
    : T[K];
};

export const defaultNS = 'core';

const resources = {
  en: {
    core: transformTranslations(core, 'en')
  },
  fr: {
    core: transformTranslations(core, 'fr')
  }
} as const;

const i18n = createInstance({
  defaultNS,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources,
  returnObjects: true,
  supportedLngs: ['en', 'fr']
});

void i18n.use(initReactI18next).init();

export { type TranslatedResource, i18n as default, resources };
