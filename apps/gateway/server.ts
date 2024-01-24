/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'node:fs/promises';
import path from 'path';
import url from 'url';

import express from 'express';
import asyncHandler from 'express-async-handler';
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT ?? 5173;
const base = process.env.BASE ?? '/';

// Cached production assets
let templateHtml = '';
let ssrManifest: string | undefined;
if (isProduction) {
  templateHtml = await fs.readFile(path.resolve(__dirname, './dist/client/index.html'), 'utf-8');
  ssrManifest = await fs.readFile(path.resolve(__dirname, './dist/client/.vite/ssr-manifest.json'), 'utf-8');
}

// Create http server
const app = express();

// Add Vite or respective production middlewares
let vite: ViteDevServer | null = null;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    appType: 'custom',
    base,
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv(path.resolve(__dirname, './dist/client'), { extensions: [] }));
}

// Serve HTML
app.use(
  '*',
  asyncHandler(async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, '');
      let template;
      let render;
      if (!isProduction) {
        // Always read fresh template in development
        template = await fs.readFile(path.resolve(__dirname, './index.html'), 'utf-8');
        template = await vite!.transformIndexHtml(url, template);
        render = (await vite!.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        template = templateHtml;
        render = (await import(path.resolve(__dirname, './dist/server/entry-server.js'))).render;
      }

      const rendered = await render(url, ssrManifest);

      const html = template
        .replace(`<!--app-head-->`, rendered.head ?? '')
        .replace(`<!--app-html-->`, rendered.html ?? '');

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      vite?.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  })
);

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
