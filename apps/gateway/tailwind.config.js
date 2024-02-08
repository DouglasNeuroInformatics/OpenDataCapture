// @ts-check

import { createConfig } from '@open-data-capture/tailwindcss';

export default createConfig({
  content: ['index.html', './src/**/*.{js,ts,jsx,tsx}'],
  include: ['@open-data-capture/instrument-renderer', '@open-data-capture/react-core'],
  root: __dirname
});
