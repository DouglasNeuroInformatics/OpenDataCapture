/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TranslatedResource } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@opendatacapture/schemas/core';

import core from './translations/core.json';

import 'i18next';

declare module 'i18next' {
  interface AppResources {}

  interface CustomResources extends AppResources {
    core: TranslatedResource<typeof core>;
  }

  interface CustomTypeOptions {
    defaultNS: 'core';
    resources: CustomResources;
  }

  interface i18n {
    resolvedLanguage?: Language;
  }
}

export const i18n: typeof import('@douglasneuroinformatics/libui/i18n').i18n;
