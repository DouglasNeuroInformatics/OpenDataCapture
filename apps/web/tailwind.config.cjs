// @ts-check

const { createConfig } = require('@opendatacapture/tailwindcss');

module.exports = createConfig({
  content: ['index.html', './src/**/*.{js,ts,jsx,tsx}'],
  include: ['@opendatacapture/instrument-renderer', '@opendatacapture/react-core'],
  root: __dirname
});
