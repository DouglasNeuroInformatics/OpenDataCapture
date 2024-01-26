import express from 'express';
import type { Promisable } from 'type-fest';

import type { AppProps } from '@/App';
import { apiRouter } from '@/api/api.router';
import { appRouter } from '@/app/app.router';
import { CONFIG } from '@/config';
import type { RenderFunction } from '@/entry-server';
import { errorHandler } from '@/middleware/error-handler';
import { ah } from '@/utils/async-handler';

export abstract class BaseServer {
  protected app: App;

  private rootLoader = ah(async (req, res, next) => {
    const url = req.url;
    try {
      const render = await this.loadRender();
      const template = await this.loadTemplate(url);
      res.locals.loadRoot = (props: AppProps) => {
        const { html } = render(props);
        return template.replace('{{ APP_PROPS_OUTLET }}', JSON.stringify(props)).replace('{{ APP_SSR_OUTLET }}', html);
      };
      next();
    } catch (err) {
      if (err instanceof Error) {
        this.fixStacktrace?.(err);
        console.error(err.stack);
      } else {
        console.error(err);
      }
      res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
    }
  });

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(this.rootLoader);
    this.app.use('/api', apiRouter);
    this.app.get('/', appRouter);
    this.app.use(errorHandler);
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
