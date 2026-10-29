import '@douglasneuroinformatics/libui/i18n';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- only an interface declaration merges into libui's own `UserConfig.Options`
    export interface Options {
      requireCompleteTranslations: true;
    }
  }
}
