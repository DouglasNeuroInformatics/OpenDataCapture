import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const clientDir = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(clientDir, '..');

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: process.env.VITE_DEV_SERVER_PORT
    },
    resolve: {
      alias: {
        '@': path.resolve(clientDir, 'src')
      }
    }
  };
});
