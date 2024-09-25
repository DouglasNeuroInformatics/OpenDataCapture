/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */

import { i18n } from '@douglasneuroinformatics/libui/i18n';

import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import core from '../translations/core.json';
import datahub from '../translations/datahub.json';
import group from '../translations/group.json';
import instruments from '../translations/instruments.json';
import layout from '../translations/layout.json';
import session from '../translations/session.json';
import setup from '../translations/setup.json';
import user from '../translations/user.json';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    export interface LanguageOptions {
      en: true;
      fr: true;
    }
    export interface Translations {
      auth: typeof auth;
      common: typeof common;
      contact: typeof contact;
      core: typeof core;
      datahub: typeof datahub;
      group: typeof group;
      instruments: typeof instruments;
      layout: typeof layout;
      session: typeof session;
      setup: typeof setup;
      user: typeof user;
    }
  }
}

i18n.init({
  translations: {
    auth,
    common,
    contact,
    core,
    datahub,
    group,
    instruments,
    layout,
    session,
    setup,
    user
  }
});

export default i18n;
