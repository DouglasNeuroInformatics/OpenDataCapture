/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TranslatedResource } from '@open-data-capture/react-core/services/i18n';
import core from '@open-data-capture/react-core/translations/core.json';

// import all namespaces (for the default language, only)
import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import instruments from '../translations/instruments.json';
import layout from '../translations/layout.json';
import overview from '../translations/overview.json';
import setup from '../translations/setup.json';
import subjects from '../translations/subjects.json';
import user from '../translations/user.json';
import visits from '../translations/visits.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      auth: TranslatedResource<typeof auth>;
      common: TranslatedResource<typeof common>;
      contact: TranslatedResource<typeof contact>;
      core: TranslatedResource<typeof core>;
      instruments: TranslatedResource<typeof instruments>;
      layout: TranslatedResource<typeof layout>;
      overview: TranslatedResource<typeof overview>;
      setup: TranslatedResource<typeof setup>;
      subjects: TranslatedResource<typeof subjects>;
      user: TranslatedResource<typeof user>;
      visits: TranslatedResource<typeof visits>;
    };
  }
}
