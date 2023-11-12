/* eslint-disable @typescript-eslint/consistent-type-definitions */

import 'i18next';

import { type TranslatedResource } from '../services/i18n';
import core from '../translations/core.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      core: TranslatedResource<typeof core>;
    };
  }
}
