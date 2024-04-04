/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TranslatedResource } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@opendatacapture/schemas/core';

import core from '../translations/core.json';

import 'i18next';

declare module 'i18next' {
  interface AppResources {}

  interface CustomResources extends AppResources {
    core: TranslatedResource<typeof core>;
  }

  interface CustomTypeOptions {
    defaultNS: typeof import('../index.ts').defaultNS;
    resources: CustomResources;
  }

  interface i18n {
    resolvedLanguage?: Language;
  }
}
