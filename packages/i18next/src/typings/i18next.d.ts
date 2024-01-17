/* eslint-disable @typescript-eslint/consistent-type-definitions */

import 'i18next';

import core from '../translations/core.json';
import { type TranslatedResource } from '../types';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      core: TranslatedResource<typeof core>;
    };
  }
}
