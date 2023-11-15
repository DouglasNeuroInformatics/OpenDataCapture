import config from '@open-data-capture/react-core/tailwind.config';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [...config.content, './src/**/*.{astro,html,js,ts}'],
  plugins: [typographyPlugin],
  presets: [config]
};
