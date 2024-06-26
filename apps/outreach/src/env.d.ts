/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
  __TRANSLATIONS__?: import('./i18n').Translations;
}
