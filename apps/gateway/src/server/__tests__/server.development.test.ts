import { once } from 'events';
import fs from 'fs';
import type { Server } from 'http';

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/config';
import type { RenderFunction } from '@/entry-server';

import { DevelopmentServer } from '../server.development';

const { createServer, vite } = vi.hoisted(() => {
  const vite = {
    middlewares: vi.fn((_req: unknown, res: { end: (body: string) => void }) => {
      res.end('served by vite');
    }),
    ssrFixStacktrace: vi.fn<(err: Error) => void>(),
    ssrLoadModule: vi.fn<(url: string) => Promise<{ render: RenderFunction }>>(),
    transformIndexHtml: vi.fn((url: string, html: string) => Promise.resolve(`${url} ${html}`))
  };
  return { createServer: vi.fn(() => Promise.resolve(vite)), vite };
});

vi.mock('vite', () => ({ createServer }));

vi.mock('@/config', async () => {
  const fs = await import('fs');
  const os = await import('os');
  const path = await import('path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gateway-development-'));
  fs.writeFileSync(path.join(root, 'index.html'), '<html>template</html>');
  return { config: { root } };
});

vi.mock('../server.base', async () => {
  const { default: express } = await import('express');
  class BaseServer {
    protected app = express();
  }
  return { BaseServer };
});

class TestDevelopmentServer extends DevelopmentServer {
  fix(err: Error) {
    return this.fixStacktrace(err);
  }

  listenOnRandomPort() {
    return this.app.listen(0);
  }

  render() {
    return this.loadRender();
  }

  template(url: string) {
    return this.loadTemplate(url);
  }
}

const openServers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map((httpServer) => {
      httpServer.closeAllConnections();
      return new Promise((resolve) => httpServer.close(resolve));
    })
  );
  vite.ssrFixStacktrace.mockClear();
  vite.ssrLoadModule.mockClear();
  vite.transformIndexHtml.mockClear();
});

afterAll(() => {
  fs.rmSync(config.root, { force: true, recursive: true });
});

describe('DevelopmentServer', () => {
  it('should create vite in middleware mode, so express stays in charge of the http server', () => {
    expect(createServer).toHaveBeenCalledWith({ appType: 'custom', server: { middlewareMode: true } });
  });

  it('should mount the vite middlewares, so client assets are served with hot reload', async () => {
    const httpServer = new TestDevelopmentServer().listenOnRandomPort();
    openServers.push(httpServer);
    await once(httpServer, 'listening');
    const address = httpServer.address();
    if (typeof address !== 'object' || address === null) {
      throw new Error(`Expected the server to listen on a port, got: ${address}`);
    }
    const response = await fetch(`http://localhost:${address.port}/src/entry-client.tsx`);
    expect(await response.text()).toBe('served by vite');
  });

  it('should let vite fix the stack trace, so an ssr error points at the original source', () => {
    const error = new Error('render failed');
    new TestDevelopmentServer().fix(error);
    expect(vite.ssrFixStacktrace).toHaveBeenCalledWith(error);
  });

  it('should load the render function from the esbuild entry through vite, so ssr picks up source changes without a restart', async () => {
    const render: RenderFunction = () => ({ html: '' });
    vite.ssrLoadModule.mockResolvedValueOnce({ render });
    await expect(new TestDevelopmentServer().render()).resolves.toBe(render);
    expect(vite.ssrLoadModule).toHaveBeenCalledWith('/dist/entry-server.js');
  });

  it('should read index.html from the app root and let vite transform it for the requested url, so the page gets the hot reload client', async () => {
    await expect(new TestDevelopmentServer().template('/assignments/1')).resolves.toBe(
      '/assignments/1 <html>template</html>'
    );
  });
});
