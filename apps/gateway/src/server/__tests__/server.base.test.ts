import { once } from 'events';
import type { Server } from 'http';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { RenderFunction } from '@/entry-server';
import { logger } from '@/logger';
import type { RootProps } from '@/Root';

import { BaseServer } from '../server.base';

type LogEntry = { level: number; req?: string; res?: number };

const { API_KEY, landingProps, logLines } = vi.hoisted(() => ({
  API_KEY: 'k'.repeat(32),
  landingProps: { activeLanguages: ['en', 'fr'], kind: 'landing', language: 'en' } satisfies RootProps,
  logLines: [] as string[]
}));

vi.mock('@/config', () => ({ config: { apiKey: API_KEY, port: 0 } }));

vi.mock('@/logger', async () => {
  const { pino } = await import('pino');
  return { logger: pino({}, { write: (line: string) => logLines.push(line) }) };
});

vi.mock('@/routers/api.router', async () => {
  const { Router } = await import('express');
  const router = Router();
  router.get('/healthcheck', (_, res) => {
    res.json({ ok: true });
  });
  router.post('/echo', (req, res) => {
    res.json(req.body);
  });
  return { apiRouter: router };
});

vi.mock('@/routers/cap.router', async () => {
  const { Router } = await import('express');
  const router = Router();
  router.post('/challenge', (_, res) => {
    res.json({ challenge: true });
  });
  return { capRouter: router };
});

vi.mock('@/routers/root.router', async () => {
  const { Router } = await import('express');
  const router = Router();
  router.get('/', (_, res) => {
    res.end(res.locals.loadRoot(landingProps));
  });
  return { rootRouter: router };
});

const TEMPLATE = '<script>{{ ROOT_PROPS_OUTLET }}</script><div id="root">{{ ROOT_SSR_OUTLET }}</div>';

class TestServer extends BaseServer {
  readonly templateUrls: string[] = [];

  constructor(
    private readonly renderLoader: () => Promise<RenderFunction> = () => {
      return Promise.resolve((props) => ({ html: `<main>${props.kind}</main>` }));
    },
    private readonly template: () => string = () => TEMPLATE
  ) {
    super();
  }

  protected loadRender() {
    return this.renderLoader();
  }

  protected loadTemplate(url: string) {
    this.templateUrls.push(url);
    return this.template();
  }
}

class StacktraceFixingServer extends TestServer {
  readonly fixedErrors: Error[] = [];

  protected override fixStacktrace(err: Error) {
    this.fixedErrors.push(err);
  }
}

const openServers: Server[] = [];

async function request(server: BaseServer, path: string, init?: RequestInit) {
  const httpServer = server.listen(0);
  openServers.push(httpServer);
  await once(httpServer, 'listening');
  const address = httpServer.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error(`Expected the server to listen on a port, got: ${address}`);
  }
  return fetch(`http://localhost:${address.port}${path}`, init);
}

function readLogEntries(): LogEntry[] {
  return logLines.map((line): LogEntry => JSON.parse(line));
}

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map((httpServer) => {
      httpServer.closeAllConnections();
      return new Promise((resolve) => httpServer.close(resolve));
    })
  );
  logLines.length = 0;
  vi.restoreAllMocks();
});

describe('BaseServer', () => {
  describe('root loader', () => {
    it('should render the root into the template, so the server sends prerendered html', async () => {
      const response = await request(new TestServer(), '/');
      expect(await response.text()).toContain('<div id="root"><main>landing</main></div>');
    });

    it('should embed the root props as base64 json, so the client hydrates with the same props', async () => {
      const response = await request(new TestServer(), '/');
      expect(await response.text()).toContain(`<script>${btoa(JSON.stringify(landingProps))}</script>`);
    });

    it('should load the template for the requested url, so vite can transform it per page in development', async () => {
      const server = new TestServer();
      await request(server, '/?lang=fr');
      expect(server.templateUrls).toStrictEqual(['/?lang=fr']);
    });

    it('should respond with a 500 when the render function cannot be loaded', async () => {
      const server = new TestServer(() => Promise.reject(new Error('missing bundle')));
      const response = await request(server, '/');
      expect(response.status).toBe(500);
      expect(await response.json()).toStrictEqual({ message: 'Internal Server Error', statusCode: 500 });
    });

    it('should log the error when the root cannot be loaded, so the cause is not lost', async () => {
      const error = new Error('missing template');
      const logError = vi.spyOn(logger, 'error');
      const server = new TestServer(undefined, () => {
        throw error;
      });
      await request(server, '/');
      expect(logError).toHaveBeenCalledWith(error);
    });

    it('should fix the stack trace of an error before logging it, so a development error points at the source', async () => {
      const error = new Error('missing template');
      const server = new StacktraceFixingServer(undefined, () => {
        throw error;
      });
      await request(server, '/');
      expect(server.fixedErrors).toStrictEqual([error]);
    });

    it('should not try to fix the stack trace of a thrown value that is not an error, since it has none', async () => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      const server = new StacktraceFixingServer(() => Promise.reject('not an error'));
      const response = await request(server, '/');
      expect(response.status).toBe(500);
      expect(server.fixedErrors).toStrictEqual([]);
    });
  });

  describe('routing', () => {
    it('should serve the cap router without an api key, so a patient can request a challenge', async () => {
      const response = await request(new TestServer(), '/api/auth/challenge', { method: 'POST' });
      expect(await response.json()).toStrictEqual({ challenge: true });
    });

    it('should reject an api request without the api key', async () => {
      const response = await request(new TestServer(), '/api/echo', { body: '{}', method: 'POST' });
      expect(response.status).toBe(401);
    });

    it('should accept a json body larger than the express default, so a large instrument bundle can be stored', async () => {
      const bundle = 'x'.repeat(1_000_000);
      const response = await request(new TestServer(), '/api/echo', {
        body: JSON.stringify({ bundle }),
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        method: 'POST'
      });
      expect(await response.json()).toStrictEqual({ bundle });
    });
  });

  describe('request logging', () => {
    it('should log a request as its method and url with the response status code', async () => {
      await request(new TestServer(), '/api/healthcheck');
      await vi.waitFor(() => {
        expect(readLogEntries()).toContainEqual(expect.objectContaining({ req: 'GET /api/healthcheck', res: 200 }));
      });
    });

    it('should log a successful response at the info level', async () => {
      await request(new TestServer(), '/api/healthcheck');
      await vi.waitFor(() => {
        expect(readLogEntries()).toContainEqual(expect.objectContaining({ level: 30, res: 200 }));
      });
    });

    it('should log a server error response at the error level, so it stands out from ordinary traffic', async () => {
      await request(new TestServer(() => Promise.reject(new Error('missing bundle'))), '/');
      await vi.waitFor(() => {
        expect(readLogEntries()).toContainEqual(expect.objectContaining({ level: 50, res: 500 }));
      });
    });
  });

  describe('listen', () => {
    it('should listen on the configured port by default and log where the server started', async () => {
      const logInfo = vi.spyOn(logger, 'info');
      const httpServer = new TestServer().listen();
      openServers.push(httpServer);
      await once(httpServer, 'listening');
      expect(logInfo).toHaveBeenCalledWith('Server started at http://localhost:0');
    });
  });
});
