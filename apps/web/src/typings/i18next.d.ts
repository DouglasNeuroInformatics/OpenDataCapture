/// <reference types="@opendatacapture/i18next" />

import type { TranslatedResource } from '@douglasneuroinformatics/libui/i18n';

import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import group from '../translations/group.json';
import instruments from '../translations/instruments.json';
import layout from '../translations/layout.json';
import overview from '../translations/overview.json';
import session from '../translations/session.json';
import setup from '../translations/setup.json';
import subjects from '../translations/subjects.json';
import user from '../translations/user.json';

declare module 'i18next' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface AppResources {
    auth: TranslatedResource<typeof auth>;
    common: TranslatedResource<typeof common>;
    contact: TranslatedResource<typeof contact>;
    group: TranslatedResource<typeof group>;
    instruments: TranslatedResource<typeof instruments>;
    layout: TranslatedResource<typeof layout>;
    overview: TranslatedResource<typeof overview>;
    session: TranslatedResource<typeof session>;
    setup: TranslatedResource<typeof setup>;
    subjects: TranslatedResource<typeof subjects>;
    user: TranslatedResource<typeof user>;
  }
}
