import fs from 'fs/promises';
import path from 'path';

import compression from 'compression';
import sirv from 'sirv';

import { CONFIG } from '@/config';
import type { RenderFunction } from '@/entry-server';

import { BaseServer } from './server.base';

const template = await fs.readFile(path.resolve(CONFIG.root, './dist/client/index.html'), 'utf-8');

export class ProductionServer extends BaseServer {
  constructor() {
    super();
    this.app.use(compression());
    this.app.use(CONFIG.base, sirv(path.resolve(CONFIG.root, './dist/client'), { extensions: [] }));
  }

  protected async loadRender() {
    return import(path.resolve(CONFIG.root, './dist/server/entry-server.js')).then((module) => {
      return (module as { render: RenderFunction }).render;
    });
  }

  protected loadTemplate() {
    return template;
  }
}
