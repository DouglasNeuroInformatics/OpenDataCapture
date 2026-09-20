/* eslint-disable @typescript-eslint/consistent-type-definitions */

import '@douglasneuroinformatics/libui/i18n';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    export interface Options {
      requireCompleteTranslations: true;
    }
  }
}
