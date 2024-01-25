import fs from 'node:fs/promises';
import path from 'path';

import express from 'express';
import asyncHandler from 'express-async-handler';

import { config } from '@/config/server.config';
import type { RenderFunction } from '@/entry-server';
import { apiRouter } from '@/routers/api.router';
import { appRouter } from '@/routers/app.router';

const app = express();

async function loadTemplateHtml() {
  if (config.mode === 'production') {
    return await fs.readFile(path.resolve(config.root, './dist/client/index.html'), 'utf-8');
  }
  return null;
}

async function loadViteDevServer() {
  if (config.mode === 'development') {
    const { createServer } = await import('vite');
    return await createServer({
      appType: 'custom',
      base: config.base,
      server: { middlewareMode: true }
    });
  }
  return null;
}

// Cached production assets
const templateHtml = await loadTemplateHtml();

// Add Vite or respective production middlewares
const vite = await loadViteDevServer();

if (config.mode === 'development') {
  app.use(vite!.middlewares);
} else {
  const { default: compression } = await import('compression');
  const { default: sirv } = await import('sirv');
  app.use(compression());
  app.use(config.base, sirv(path.resolve(config.root, './dist/client'), { extensions: [] }));
}

app.use('/api', apiRouter);
app.use('/app', appRouter);

// Serve HTML
app.use(
  '*',
  asyncHandler(async (req, res, next) => {
    const url = req.originalUrl.replace(config.base, '');
    try {
      let template: string;
      let render: RenderFunction;
      if (config.mode === 'development') {
        template = await fs.readFile(path.resolve(config.root, './index.html'), 'utf-8');
        template = await vite!.transformIndexHtml(url, template);
        render = ((await vite!.ssrLoadModule('/src/entry-server.tsx')) as { render: RenderFunction }).render;
      } else {
        template = templateHtml!;
        render = (
          (await import(path.resolve(config.root, './dist/server/entry-server.js'))) as { render: RenderFunction }
        ).render;
      }

      const props = { message: 'Hello From Server' };
      const { html } = render(props);
      const content = template
        .replace('{{ APP_PROPS_OUTLET }}', JSON.stringify(props))
        .replace('{{ APP_SSR_OUTLET }}', html);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(content);
    } catch (err) {
      if (err instanceof Error) {
        vite?.ssrFixStacktrace(err);
        console.error(err.stack);
      } else {
        console.error(err);
      }
      next(err);
    }
  })
);

// Start http server
app.listen(config.port, () => {
  console.log(`Server started at http://localhost:${config.port}`);
});
