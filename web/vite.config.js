// @ts-check

import cp from 'child_process';
import path from 'path';
import url from 'url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    process.env = {
      ...process.env,
      VITE_DEV_GIT_BRANCH: cp.execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim(),
      VITE_DEV_GIT_COMMIT: cp.execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(),
      VITE_DEV_GIT_COMMIT_DATE: new Date(
        cp.execSync('git log -1 --format=%cd --date=format:"%Y-%m-%d"', { encoding: 'utf-8' })
      ).toDateString()
    };
  }

  return {
    plugins: [react(), viteCompression()],
    server: {
      port: parseInt(process.env.WEB_DEV_SERVER_PORT ?? '3000'),
      proxy: {
        '/api/': {
          target: {
            host: 'localhost',
            port: parseInt(process.env.API_DEV_SERVER_PORT ?? '5500')
          },
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(projectDir, 'src')
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [path.resolve(projectDir, 'src', 'test', 'setup.ts')]
    }
  };
});
