/// @ts-check
/// <reference types="vite/client" />

import { i18n } from '@opendatacapture/i18next';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import * as esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import '@douglasneuroinformatics/libui/styles/globals.css';

await i18n.init();
await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

/** @type {import('@storybook/react').Preview} */
const preview = {
  decorators: [
    // @ts-ignore
    withThemeByDataAttribute({
      attributeName: 'data-mode',
      defaultTheme: 'light',
      themes: {
        dark: 'dark',
        light: 'light'
      }
    })
  ],
  globals: {
    locale: 'en',
    locales: {
      en: 'English',
      fr: 'Français'
    }
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    i18n,
    layout: 'fullscreen'
  }
};

export default preview;
