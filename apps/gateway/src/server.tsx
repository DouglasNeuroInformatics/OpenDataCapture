/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { ComponentType } from 'react';
import { renderToReadableStream } from 'react-dom/server';

import fs from 'fs/promises';
import path from 'path';
import { Router } from './utils/router';

const PROJECT_ROOT = path.resolve(import.meta.dir, '..');
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, 'public');
const BUILD_DIR = path.resolve(PROJECT_ROOT, 'dist');

await fs.rm(BUILD_DIR, { recursive: true, force: true });
await fs.mkdir(BUILD_DIR);

const srcRouter = new Router(path.resolve(import.meta.dir, 'pages'));

await Bun.build({
  entrypoints: [path.resolve(import.meta.dir, 'hydrate.tsx'), ...Object.values(srcRouter.routes)],
  minify: true,
  outdir: BUILD_DIR,
  target: 'browser',
  splitting: true
});

const buildRouter = new Router(BUILD_DIR + '/pages');

async function serveFromDir(config: { directory: string; path: string }): Promise<Response | null> {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ['', '.html', 'index.html'];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = await fs.stat(pathWithSuffix);
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix));
      }
    } catch (err) {}
  }

  return null;
}

const server = Bun.serve({
  fetch: async (request) => {
    const url = new URL(request.url);
    const match = srcRouter.match(request);
    console.log(`${request.method} ${url.pathname}`);
    if (match) {
      console.log('is match', match.filePath);
      const builtMatch = buildRouter.match(request);
      if (!builtMatch) {
        console.error('No built match for route: ' + request.url);
        return new Response('Unknown error', { status: 500 });
      }

      const Page: ComponentType = (await import(match.filePath)).default;
      const stream = await renderToReadableStream(<Page />, {
        bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        bootstrapModules: ['/hydrate.js']
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    let reqPath = url.pathname;
    if (reqPath === '/') {
      reqPath = '/index.html';
    }

    const publicResponse = await serveFromDir({
      directory: PUBLIC_DIR,
      path: reqPath
    });
    if (publicResponse) {
      return publicResponse;
    }

    const buildResponse = await serveFromDir({ directory: BUILD_DIR, path: reqPath });
    if (buildResponse) {
      return buildResponse;
    }

    const pagesResponse = await serveFromDir({
      directory: BUILD_DIR + '/pages',
      path: reqPath
    });
    if (pagesResponse) {
      return pagesResponse;
    }

    return new Response('Not Found', {
      status: 404
    });
  },
  port: 3500
});

console.log(`Application is running on port ${server.port}`);
