const { createConfig } = require('@opendatacapture/tailwindcss');
const typographyPlugin = require('@tailwindcss/typography');

/** @type {import('tailwindcss').Config} */
module.exports = createConfig({
  content: ['./src/**/*.{astro,html,js,md,mdx,ts}'],
  plugins: [typographyPlugin()],
  root: __dirname
});
