import config from '@douglasneuroinformatics/ui/tailwind.config';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  plugins: [typographyPlugin],
  presets: [config]
};
