// @ts-check

import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 3500
    },
    resolve: {
      alias: {
        '@': path.resolve(projectDir, 'src')
      }
    }
  };
});
