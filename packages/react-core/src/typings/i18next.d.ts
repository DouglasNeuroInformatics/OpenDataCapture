/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { defaultNS, resources } from '../services/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
