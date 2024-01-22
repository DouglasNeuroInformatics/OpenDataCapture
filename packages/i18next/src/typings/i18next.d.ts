/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import 'i18next';

import core from '../translations/core.json';

import type { DefaultNS, TranslatedResource } from '..';

declare module 'i18next' {
  interface AppResources {}

  interface CustomResources extends AppResources {
    core: TranslatedResource<typeof core>;
  }

  interface CustomTypeOptions {
    defaultNS: DefaultNS;
    resources: CustomResources;
  }
}
