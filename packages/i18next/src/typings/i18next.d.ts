/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { Language } from '@open-data-capture/common/core';
import 'i18next';

import core from '../translations/core.json';

import type { DefaultNS, TranslatedResource } from '../types.js';

declare module 'i18next' {
  interface AppResources {}

  interface CustomResources extends AppResources {
    core: TranslatedResource<typeof core>;
  }

  interface CustomTypeOptions {
    defaultNS: DefaultNS;
    resources: CustomResources;
  }

  interface i18n {
    resolvedLanguage?: Language;
  }
}
