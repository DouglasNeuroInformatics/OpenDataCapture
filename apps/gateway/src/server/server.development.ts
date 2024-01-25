import fs from 'fs/promises';
import path from 'path';

import { createServer } from 'vite';

import type { RenderFunction } from '@/entry-server';

import { BaseServer } from './server.base';
import { SERVER_CONFIG } from './server.config';

const _vite = await createServer({
  appType: 'custom',
  base: SERVER_CONFIG.base,
  server: { middlewareMode: true }
});

export class DevelopmentServer extends BaseServer {
  private vite = _vite;

  constructor(protected app: App) {
    super(app);
    this.app.use(this.vite.middlewares);
  }

  protected fixStacktrace(err: Error) {
    return this.vite.ssrFixStacktrace(err);
  }

  protected async loadRender() {
    return this.vite.ssrLoadModule('/src/entry-server.tsx').then((module) => {
      return (module as { render: RenderFunction }).render;
    });
  }

  protected async loadTemplate(url: string) {
    const html = await fs.readFile(path.resolve(SERVER_CONFIG.root, './index.html'), 'utf-8');
    return this.vite.transformIndexHtml(url, html);
  }
}
