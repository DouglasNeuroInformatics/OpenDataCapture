const config = require('@douglasneuroinformatics/libui/tailwind/config');
const typographyPlugin = require('@tailwindcss/typography');

module.exports = config({
  content: ['./src/**/*.{astro,html,js,md,mdx,ts}'],
  plugins: [typographyPlugin()],
  root: __dirname
});
