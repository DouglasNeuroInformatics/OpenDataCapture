import fs from 'fs';
import path from 'path';

import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

import type { PlaygroundConfig } from './src/preview/config';

// Read straight from the monorepo root rather than through `@opendatacapture/release-info`: that
// package pulls in `@opendatacapture/schemas`, which ships raw TypeScript, and loading it here would
// mean running this config under tsx as `apps/web` does.
const { version } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../package.json'), 'utf-8')) as {
  version: string;
};

/** Serves `/config.json` as the Caddyfile does in the published image, so both read the same variable. */
const playgroundConfig = (): Plugin => ({
  configureServer(server) {
    server.middlewares.use('/config.json', (_request, response) => {
      const config: PlaygroundConfig = { previewOrigin: process.env.PLAYGROUND_PREVIEW_ORIGIN ?? '' };
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(config));
    });
  },
  name: 'playground-config'
});

export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    rollupOptions: {
      external: ['esbuild'],
      input: {
        index: path.resolve(import.meta.dirname, 'index.html'),
        preview: path.resolve(import.meta.dirname, 'preview.html')
      }
    },
    sourcemap: true,
    target: 'es2022'
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __GITHUB_REPO_URL__: `'${process.env.GITHUB_REPO_URL ?? '#'}'`
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    },
    exclude: ['@swc/wasm-web'],
    include: ['react/*', 'react-dom/*']
  },
  plugins: [
    playgroundConfig(),
    react(),
    runtime({
      disabled: mode === 'test',
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
    // The preview frame runs on the other loopback name (see `resolvePreviewOrigin`). Left to
    // resolve `localhost` itself, Vite listens on ::1 alone under Node 24, and 127.0.0.1 refuses to
    // connect. Browsers try both addresses for `localhost`, so this serves both names without
    // opening the server to the network the way `host: true` would.
    host: '127.0.0.1',
    port: parseInt(process.env.PLAYGROUND_DEV_SERVER_PORT ?? '3750')
  }
}));
