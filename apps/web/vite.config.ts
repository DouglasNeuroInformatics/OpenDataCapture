import fs from 'node:fs';
import path from 'node:path';

import { parseNumber } from '@douglasneuroinformatics/libjs';
import importMetaEnv from '@import-meta-env/unplugin';
import { getReleaseInfo } from '@opendatacapture/release-info';
import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(async ({ command }) => {
  const apiPort = parseNumber(process.env.API_DEV_SERVER_PORT);
  const webPort = parseNumber(process.env.WEB_DEV_SERVER_PORT);

  if (command === 'serve') {
    if (Number.isNaN(apiPort)) {
      throw new Error(`Expected API_DEV_SERVER_PORT to be number, got ${process.env.API_DEV_SERVER_PORT}`);
    } else if (Number.isNaN(webPort)) {
      throw new Error(`Expected WEB_DEV_SERVER_PORT to be number, got ${process.env.WEB_DEV_SERVER_PORT}`);
    }
  }

  // `vite preview` serves the production build to the end-to-end suite on the same origin, so it
  // needs the same port and `/api` proxy as the dev server.
  const server = {
    port: webPort,
    proxy: {
      '/api/': {
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        target: {
          host: 'localhost',
          port: apiPort
        }
      }
    }
  };

  return {
    build: {
      chunkSizeWarningLimit: 1000,
      emptyOutDir: false,
      rolldownOptions: {
        external: ['esbuild']
      },
      sourcemap: true,
      target: 'es2022'
    },
    define: {
      __RELEASE__: JSON.stringify(await getReleaseInfo())
    },
    optimizeDeps: {
      include: ['react/*', 'react-dom/*'],
      rolldownOptions: {
        transform: {
          target: 'es2022'
        }
      }
    },
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
        generatedRouteTree: './src/route-tree.ts',
        routeFileIgnorePattern: '^__tests__$',
        target: 'react'
      }),
      react(),
      viteCompression(),
      importMetaEnv.vite({
        example: path.resolve(import.meta.dirname, '.env.public')
      }) as any,
      // The import-meta-env CLI that `preview` runs restores dist/index.html from the
      // dist/index.html.bak it saved on its last run before injecting the environment. With
      // `emptyOutDir: false` that copy outlives its build and would put an earlier build's page back
      // over this one, so each build writes its own.
      {
        apply: 'build',
        name: 'import-meta-env-backup',
        writeBundle() {
          const indexPath = path.resolve(import.meta.dirname, 'dist/index.html');
          fs.copyFileSync(indexPath, `${indexPath}.bak`);
        }
      },
      runtime({
        rootDir: import.meta.dirname
      }),
      tailwindcss()
    ],
    // A preview on any other port would serve the suite nothing, so fail rather than move.
    preview: { ...server, strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    },
    server
  };
});
