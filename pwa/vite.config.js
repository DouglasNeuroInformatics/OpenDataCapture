// @ts-check

import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(projectDir, 'src')
    }
  },
  server: {
    port: parseInt(process.env.PWA_DEV_SERVER_PORT ?? '3500'),
  }
});
