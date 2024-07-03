import starlightPlugin from '@astrojs/starlight-tailwind';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,md,mdx,ts}'],
  plugins: [starlightPlugin()],
  theme: {
    extend: {
      colors: {
        accent: colors.sky,
        gray: colors.slate
      }
    }
  }
};
