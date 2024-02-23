// @ts-check

import { createConfig } from '@open-data-capture/tailwindcss';

export default createConfig({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  include: ['@open-data-capture/react-core'],
  root: import.meta.url
});
