import { withThemeByDataAttribute } from '@storybook/addon-themes';
import esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import i18n from '../src/services/i18n';

import '@douglasneuroinformatics/libui/styles/globals.css';

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
    i18n
  }
};

export default preview;
