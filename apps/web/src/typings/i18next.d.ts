// import the original type declarations
import type { Language } from '@open-data-capture/types';
import 'i18next';
import type { ValueOf } from 'type-fest';

// import all namespaces (for the default language, only)
import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import layout from '../translations/layout.json';
import overview from '../translations/overview.json';
import setup from '../translations/setup.json';
import subjects from '../translations/subjects.json';
import visits from '../translations/visits.json';

type TranslatedResource<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? T[K] extends Record<Language, unknown>
      ? ValueOf<T[K]>
      : TranslatedResource<T[K]>
    : T[K];
};

declare module 'i18next' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      auth: TranslatedResource<typeof auth>;
      common: TranslatedResource<typeof common>;
      contact: TranslatedResource<typeof contact>;
      layout: TranslatedResource<typeof layout>;
      overview: TranslatedResource<typeof overview>;
      setup: TranslatedResource<typeof setup>;
      subjects: TranslatedResource<typeof subjects>;
      visits: TranslatedResource<typeof visits>;
    };
  }
}
