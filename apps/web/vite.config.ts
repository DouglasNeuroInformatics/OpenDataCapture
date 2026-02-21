import path from 'path';

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

  return {
    build: {
      chunkSizeWarningLimit: 1000,
      emptyOutDir: false,
      rollupOptions: {
        external: ['esbuild']
      },
      sourcemap: true,
      target: 'es2022'
    },
    define: {
      __RELEASE__: JSON.stringify(await getReleaseInfo())
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022'
      },
      include: ['react/*', 'react-dom/*']
    },
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
        generatedRouteTree: './src/route-tree.ts',
        target: 'react'
      }),
      react(),
      viteCompression(),
      importMetaEnv.vite({
        example: path.resolve(import.meta.dirname, '.env.public')
      }) as any,
      runtime({
        rootDir: import.meta.dirname
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    },
    server: {
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
    }
  };
});
