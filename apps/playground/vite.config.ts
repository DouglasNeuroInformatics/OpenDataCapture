import fs from 'node:fs';
import path from 'node:path';

import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

import type { PlaygroundConfig } from './src/preview/config.ts';

// Read straight from the monorepo root rather than through `@opendatacapture/release-info`: that
// package pulls in `@opendatacapture/schemas`, which ships raw TypeScript, and loading it here would
// mean running this config under tsx as `apps/web` does.
const { version } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../package.json'), 'utf-8')) as {
  version: string;
};

/**
 * Serves `/config.json` as the Caddyfile does in the published image, so all three read the same
 * variable: the dev server, and `vite preview` serving the build to the end-to-end suite.
 */
const playgroundConfig = (): Plugin => {
  const serveConfig = (server: PreviewServer | ViteDevServer) => {
    server.middlewares.use('/config.json', (_request, response) => {
      const config: PlaygroundConfig = { previewOrigin: process.env.PLAYGROUND_PREVIEW_ORIGIN ?? '' };
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(config));
    });
  };
  return { configurePreviewServer: serveConfig, configureServer: serveConfig, name: 'playground-config' };
};

// The preview frame runs on the other loopback name (see `resolvePreviewOrigin`). Left to resolve
// `localhost` itself, Vite listens on ::1 alone under Node 24, and 127.0.0.1 refuses to connect.
// Browsers try both addresses for `localhost`, so this serves both names without opening the server
// to the network the way `host: true` would. `vite preview` serves the build to the end-to-end suite
// on the same address.
const server = {
  host: '127.0.0.1',
  port: parseInt(process.env.PLAYGROUND_DEV_SERVER_PORT ?? '3750', 10)
};

export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    rolldownOptions: {
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
    exclude: ['@swc/wasm-web'],
    include: ['react/*', 'react-dom/*'],
    rolldownOptions: {
      transform: {
        target: 'es2022'
      }
    }
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
  // A preview on any other port would serve the suite nothing, so fail rather than move.
  preview: { ...server, strictPort: true },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  server
}));
