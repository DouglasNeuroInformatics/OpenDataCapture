import { config } from '@douglasneuroinformatics/eslint-config';

export default config(
  {
    astro: {
      enabled: true
    },
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    react: {
      enabled: true,
      version: '18'
    },
    typescript: {
      enabled: true
    }
  },
  {
    ignores: [
      'apps/playground/src/instruments/examples/interactive/Interactive-With-Legacy-Script/legacy.js',
      'runtime/v1/src/**/*.d.ts'
    ]
  }
);
