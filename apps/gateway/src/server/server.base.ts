import type { Request, Response } from 'express';
import express from 'express';
import type { Promisable } from 'type-fest';

import { apiRouter } from '@/api/api.router';
import { CONFIG } from '@/config';
import type { RenderFunction } from '@/entry-server';
import { errorHandler } from '@/middleware/error-handler';
import { ah } from '@/utils/async-handler';

export abstract class BaseServer {
  protected app: App;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use('/api', apiRouter);
    this.app.get('/', ah(this.appHandler.bind(this)));
    this.app.use(errorHandler);
  }

  async appHandler(req: Request, res: Response) {
    const url = req.url;
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
      res.status(500).send({ message: 'Internal Server Error', statusCode: 500 });
    }
  }

  protected fixStacktrace?(err: Error): void;

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
