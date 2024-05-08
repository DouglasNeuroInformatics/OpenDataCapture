import express, { type Request, type Response } from 'express';
import PinoHttp from 'pino-http';
import PinoPretty from 'pino-pretty';
import type { Promisable } from 'type-fest';

import type { RootProps } from '@/Root';
import { CONFIG } from '@/config';
import type { RenderFunction } from '@/entry-server';
import { apiKeyMiddleware } from '@/middleware/api-key.middleware';
import { errorHandlerMiddleware } from '@/middleware/error-handler.middleware';
import { apiRouter } from '@/routers/api.router';
import { rootRouter } from '@/routers/root.router';
import { ah } from '@/utils/async-handler';

export abstract class BaseServer {
  protected app: App;

  private rootLoader = ah(async (req, res, next) => {
    const url = req.url;
    try {
      const render = await this.loadRender();
      const template = await this.loadTemplate(url);
      res.locals.loadRoot = (props: RootProps) => {
        const { html } = render(props);
        return template
          .replace('{{ ROOT_PROPS_OUTLET }}', btoa(JSON.stringify(props)))
          .replace('{{ ROOT_SSR_OUTLET }}', html);
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
    this.app.use(
      express.json({
        limit: '50mb'
      })
    );
    this.app.use(
      PinoHttp(
        {
          customLogLevel: (_, res) => {
            return res.statusCode >= 500 ? 'error' : 'info';
          },
          serializers: {
            req: (req: Request) => {
              return `${req.method} ${req.url}`;
            },
            res: (res: Response) => {
              return res.statusCode;
            }
          },
          wrapSerializers: false
        },
        PinoPretty({
          colorize: true
        })
      )
    );
    this.app.use('/api', apiKeyMiddleware, apiRouter);
    this.app.use('/', this.rootLoader, rootRouter);
    this.app.use(errorHandlerMiddleware);
  }

  protected fixStacktrace?(err: Error): void;

  listen(port = CONFIG.port) {
    return this.app.listen(port, () => {
      // eslint-disable-next-line no-console
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
