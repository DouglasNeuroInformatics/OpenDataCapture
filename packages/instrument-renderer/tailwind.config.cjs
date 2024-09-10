const config = require('@douglasneuroinformatics/libui/tailwind/config');

module.exports = config({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  include: ['@opendatacapture/react-core']
});
