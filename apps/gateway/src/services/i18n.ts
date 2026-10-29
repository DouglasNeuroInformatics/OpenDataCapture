/* eslint-disable @typescript-eslint/consistent-type-definitions -- libui's UserConfig.Options can only be augmented by merging into its interface; a type alias would redeclare it */
/* eslint-disable @typescript-eslint/no-namespace -- libui exports UserConfig as a namespace, and augmenting a namespace requires redeclaring it */

import { i18n } from '@douglasneuroinformatics/libui/i18n';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    export interface Options {
      requireCompleteTranslations: true;
    }
  }
}

// `defaultLanguage` is deliberately left unset. It is what `t()` falls back to when a string has no
// entry in the resolved language, so pointing it at the patient's language would make every string
// missing a translation render as nothing. The session's language is set with `changeLanguage`.
i18n.init({
  translations: {}
});

export { i18n };
