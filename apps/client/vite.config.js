import cp from 'child_process';
import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const clientDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    process.env = {
      ...process.env,
      VITE_DEV_GIT_BRANCH: cp.execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim(),
      VITE_DEV_GIT_COMMIT: cp.execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(),
      VITE_DEV_GIT_COMMIT_DATE: new Date(
        cp.execSync('git log -1 --format=%cd --date=format:"%Y-%m-%d"', { encoding: 'utf-8' })
      ).toDateString()
    };
  }

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
      setupFiles: [path.resolve(clientDir, 'src', 'test', 'setup.ts')]
    }
  };
});
