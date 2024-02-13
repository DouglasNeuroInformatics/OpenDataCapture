// @ts-check

import { createConfig } from '@open-data-capture/tailwindcss';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default createConfig({
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  include: ['@open-data-capture/react-core'],
  plugins: [typographyPlugin],
  root: __dirname
});
