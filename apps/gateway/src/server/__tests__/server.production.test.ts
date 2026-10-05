import { once } from 'events';
import fs from 'fs';

import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/config';

import { ProductionServer } from '../server.production';

const { LARGE_ASSET, TEMPLATE } = vi.hoisted(() => ({
  LARGE_ASSET: `console.log('${'x'.repeat(4096)}');`,
  TEMPLATE: '<html>{{ ROOT_SSR_OUTLET }}</html>'
}));

vi.mock('@/config', async () => {
  const fs = await import('fs');
  const os = await import('os');
  const path = await import('path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gateway-production-'));
  const write = (file: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  };
  write('dist/client/index.html', TEMPLATE);
  write('dist/client/assets/app.js', LARGE_ASSET);
  write('dist/client/about.html', '<html>about</html>');
  write('dist/runtime/v1/index.js', 'export {};');
  write('dist/server/entry-server.js', "export const render = (props) => ({ html: 'rendered ' + props.kind });");
  return { config: { root } };
});

vi.mock('../server.base', async () => {
  const { default: express } = await import('express');
  class BaseServer {
    protected app = express();
  }
  return { BaseServer };
});

class TestProductionServer extends ProductionServer {
  listenOnRandomPort() {
    return this.app.listen(0);
  }

  render() {
    return this.loadRender();
  }

  template() {
    return this.loadTemplate();
  }
}

const closeServers: (() => void)[] = [];

async function request(path: string, init?: RequestInit) {
  const httpServer = new TestProductionServer().listenOnRandomPort();
  closeServers.push(() => httpServer.close());
  await once(httpServer, 'listening');
  const address = httpServer.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error(`Expected the server to listen on a port, got: ${address}`);
  }
  return fetch(`http://localhost:${address.port}${path}`, init);
}

afterEach(() => {
  closeServers.splice(0).forEach((close) => close());
});

afterAll(() => {
  fs.rmSync(config.root, { force: true, recursive: true });
});

describe('ProductionServer', () => {
  it('should serve the built client assets from the root path', async () => {
    const response = await request('/assets/app.js');
    expect(await response.text()).toBe(LARGE_ASSET);
  });

  it('should serve the built runtime under /runtime, so instruments can import it', async () => {
    const response = await request('/runtime/v1/index.js');
    expect(await response.text()).toBe('export {};');
  });

  it('should not resolve an extensionless path to an html file, so the root router handles page urls', async () => {
    const response = await request('/about');
    expect(response.status).toBe(404);
  });

  it('should compress responses for clients that accept it', async () => {
    const response = await request('/assets/app.js', { headers: { 'Accept-Encoding': 'gzip' } });
    expect(response.headers.get('content-encoding')).toBe('gzip');
  });

  it('should use the built client index.html as the template', () => {
    expect(new TestProductionServer().template()).toBe(TEMPLATE);
  });

  it('should load the render function from the built ssr entry', async () => {
    const render = await new TestProductionServer().render();
    expect(render({ activeLanguages: ['en'], kind: 'landing', language: 'en' })).toStrictEqual({
      html: 'rendered landing'
    });
  });
});
