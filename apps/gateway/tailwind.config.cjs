const config = require('@douglasneuroinformatics/libui/tailwind/config');

module.exports = config({
  content: ['index.html', './src/**/*.{js,ts,jsx,tsx}'],
  include: ['@opendatacapture/instrument-renderer', '@opendatacapture/react-core'],
  root: __dirname
});
