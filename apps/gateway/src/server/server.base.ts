import type { NextFunction, Request, Response, Router } from 'express';
import express from 'express';
import type { Promisable } from 'type-fest';

import { CONFIG } from '@/config';
import type { RenderFunction } from '@/entry-server';
import { ah } from '@/utils/async-handler';

export abstract class BaseServer {
  protected app: App;
  
  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  addRoutes(routes: { path: string; router: Router }[]) {
    routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });
    this.app.use(ah(this.handler.bind(this)));
  }

  protected fixStacktrace?(err: Error): void;

  async handler(req: Request, res: Response, next: NextFunction) {
    const url = req.originalUrl.replace(CONFIG.base, '');
    try {
      const render = await this.loadRender();
      const template = await this.loadTemplate(url);
      const props = { message: 'Hello From Server' };
      const { html } = render(props);
      const content = template
        .replace('{{ APP_PROPS_OUTLET }}', JSON.stringify(props))
        .replace('{{ APP_SSR_OUTLET }}', html);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(content);
    } catch (err) {
      if (err instanceof Error) {
        this.fixStacktrace?.(err);
        console.error(err.stack);
      } else {
        console.error(err);
      }
      next(err);
    }
  }

  listen(port = CONFIG.port) {
    return this.app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  }

  protected abstract loadRender(): Promise<RenderFunction>;

  protected abstract loadTemplate(url: string): Promisable<string>;
}

export type AppServer = {
  new (): InstanceType<typeof BaseServer>;
  prototype: InstanceType<typeof BaseServer>;
};
