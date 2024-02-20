// @ts-check

import { createConfig } from '@open-data-capture/tailwindcss';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default createConfig({
  content: ['./src/**/*.{astro,html,js,ts}'],
  plugins: [typographyPlugin],
  root: __dirname
});
