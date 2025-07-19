import path from 'path';

import importMetaEnv from '@import-meta-env/unplugin';
import { getReleaseInfo } from '@opendatacapture/release-info';
import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
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
    // @ts-expect-error - conflict with vite version of subdependency, but works with v6
    importMetaEnv.vite({
      example: path.resolve(import.meta.dirname, '.env.public')
    }),
    runtime(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  server: {
    port: parseInt(process.env.WEB_DEV_SERVER_PORT ?? '3000'),
    proxy: {
      '/api/': {
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: {
          host: 'localhost',
          port: parseInt(process.env.API_DEV_SERVER_PORT ?? '5500')
        }
      }
    }
  }
});
