import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const clientDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: process.env.VITE_DEV_SERVER_PORT
    },
    resolve: {
      alias: {
        '@': path.resolve(clientDir, 'src')
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts']
    }
  };
});
