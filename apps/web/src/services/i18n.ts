/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { resolveActiveLanguage } from '@opendatacapture/schemas/core';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';

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

/**
 * Move a reader off a language their instance no longer offers, and report whether it moved them.
 *
 * Called before the app renders rather than from a component: `changeLanguage` notifies only the
 * components already subscribed, libui's `useTranslation` subscribes in an effect, and effects run
 * child-first — so a correction made after mount never reaches the ancestors of whatever made it.
 * The sidebar renders the language toggle, so the sidebar is what a late correction leaves behind.
 */
export const reconcileInterfaceLanguage = (activeLanguages: ActiveLanguages): boolean => {
  const language = resolveActiveLanguage(i18n.resolvedLanguage, activeLanguages);
  if (language === i18n.resolvedLanguage) {
    return false;
  }
  i18n.changeLanguage(language);
  return true;
};

export default i18n;
