import path from 'path';
import url from 'url';

import runtime from '@open-data-capture/vite-plugin-runtime';
import tailwind from '@open-data-capture/vite-plugin-tailwind';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    target: 'es2022'
  },
  plugins: [
    react(),
    runtime(),
    tailwind({
      content: ['index.html', './src/**/*.{js,ts,jsx,tsx}'],
      include: ['@open-data-capture/instrument-renderer', '@open-data-capture/react-core'],
      root: import.meta.url
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
