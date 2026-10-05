import * as fs from 'node:fs';
import * as net from 'node:net';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// A real watcher would keep firing against a deleted temp directory after each test, so `fs.watch`
// is stubbed. It is a named ESM export, which vitest cannot `spyOn` directly ("Module namespace is
// not configurable"), so it is replaced at the module level instead. `watchCallbacks` captures what
// each call registered so a test can trigger the rebuild deliberately, and `watchCloses` records
// every `close()` so a test can assert `Server.stop()` disposes the handles rather than leaking them.
const { watchCallbacks, watchCloses } = vi.hoisted(() => ({
  watchCallbacks: [] as (() => void)[],
  watchCloses: [] as ReturnType<typeof vi.fn>[]
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    watch: (_target: unknown, _options: unknown, callback: () => void) => {
      watchCallbacks.push(callback);
      const close = vi.fn();
      watchCloses.push(close);
      return { close };
    }
  };
});

// `bundle` is wrapped, not replaced: every test still runs the real bundler, and one test can make it
// reject with a non-Error value, which no real instrument source provokes.
vi.mock('@opendatacapture/instrument-bundler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@opendatacapture/instrument-bundler')>();
  return { ...actual, bundle: vi.fn(actual.bundle) };
});

import { bundle } from '@opendatacapture/instrument-bundler';
import { decodeBase64ToUnicode } from '@opendatacapture/runtime-internal';
import { MANIFEST_FILENAME } from '@opendatacapture/runtime-meta';

import { Server } from '../server';

// `renderPage` reads its client bundle from a built `client.js` next to the compiled `server.js`,
// which does not exist under this (unbuilt, TS-run-directly) test environment. Every other
// `fs.promises.readFile` call — the real instrument sources `InstrumentLoader` reads off disk —
// is left to hit the real filesystem, so this is a real bundling/serving cycle end to end.
const originalReadFile = fs.promises.readFile.bind(fs.promises);

function stubClientBundle() {
  vi.spyOn(fs.promises, 'readFile').mockImplementation(((filepath: any, ...rest: any[]) => {
    if (typeof filepath === 'string' && filepath.endsWith('client.js')) {
      return Promise.resolve('/* stub client bundle */');
    }
    return originalReadFile(filepath, ...(rest as [any]));
  }) as typeof fs.promises.readFile);
}

// `Server.start` never rejects on `EADDRINUSE` (the error is emitted, not passed to the listen
// callback), so a port that happens to be taken hangs the test until it times out. Asking the OS
// for a free port avoids the collisions a random pick from a fixed range runs into on shared CI.
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, () => {
      const { port } = probe.address() as net.AddressInfo;
      probe.close(() => resolve(port));
    });
  });
}

let tmpDir: string;
let port: number;

const tmpDirs: string[] = [];

beforeAll(() => {
  vi.stubGlobal('__TAILWIND_STYLES__', btoa('body{}'));
});

afterAll(() => {
  vi.unstubAllGlobals();
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-instrument-server-'));
  tmpDirs.push(tmpDir);
  port = await getFreePort();
  stubClientBundle();
  watchCallbacks.length = 0;
  watchCloses.length = 0;
  vi.mocked(bundle).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const FORM_SOURCE = `export default {
  content: {},
  details: { title: 'Stub Form' },
  kind: 'FORM',
  language: 'en',
  measures: {}
};`;

const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function withServer(mode: 'all' | 'single', run: () => Promise<void>, verbose = false) {
  const server = await Server.create({ mode, port, target: tmpDir, verbose });
  await server.start();
  try {
    await run();
  } finally {
    await server.stop();
  }
}

function spyOnLogs(method: 'error' | 'log') {
  const spy = vi.spyOn(console, method).mockImplementation(() => undefined);
  return {
    some: (pattern: RegExp) => spy.mock.calls.some(([message]) => typeof message === 'string' && pattern.test(message))
  };
}

function extractEncodedBundle(html: string) {
  const encodedBundle = /"encodedBundle":"([^"]+)"/.exec(html)?.[1];
  if (!encodedBundle) {
    throw new Error('The page carries no encoded bundle');
  }
  return decodeBase64ToUnicode(encodedBundle);
}

describe('Server — single mode', () => {
  it('should serve the compiled instrument at the root path', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Open Data Capture');
      expect(html).toContain('id="root"');
    } finally {
      await server.stop();
    }
  });

  it('should rebuild the bundle when the watched directory reports a change', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      // Populate the initial bundle first, then simulate the file watcher firing.
      await fetch(`http://localhost:${port}/`);
      expect(watchCallbacks).toHaveLength(1);
      watchCallbacks[0]!();
      await vi.waitFor(() => {
        expect(
          logSpy.mock.calls.some(([message]) => typeof message === 'string' && message.includes('rebuilding'))
        ).toBe(true);
      });
    } finally {
      logSpy.mockRestore();
      await server.stop();
    }
  });

  it('should close the file watcher on stop, so a stopped server leaks no watch handle', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    expect(watchCloses).toHaveLength(1);
    await server.stop();
    expect(watchCloses[0]).toHaveBeenCalledOnce();
  });

  it('should reject a non-GET request with 405', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/`, { method: 'POST' });
      expect(res.status).toBe(405);
    } finally {
      await server.stop();
    }
  });

  it('should 404 an unknown path', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/nowhere`);
      expect(res.status).toBe(404);
    } finally {
      await server.stop();
    }
  });

  it('should 404 an unresolvable runtime asset', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/runtime/v1/does-not-exist.js`);
      expect(res.status).toBe(404);
    } finally {
      await server.stop();
    }
  });

  it('should reuse the compiled bundle on a repeat request, so serving a page does not rebuild it', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    await withServer('single', async () => {
      await fetch(`http://localhost:${port}/`);
      await fetch(`http://localhost:${port}/`);
    });
    expect(bundle).toHaveBeenCalledOnce();
  });

  it('should inline an imported image as a data URL, so binary assets survive bundling', async () => {
    fs.writeFileSync(path.join(tmpDir, 'logo.png'), Buffer.from(PNG_BASE64, 'base64'));
    fs.writeFileSync(
      path.join(tmpDir, 'index.ts'),
      FORM_SOURCE.replace('export default {', "import logo from './logo.png';\nexport default {\n  logo,")
    );
    await withServer('single', async () => {
      const res = await fetch(`http://localhost:${port}/`);
      expect(extractEncodedBundle(await res.text())).toContain(`data:image/png;base64,${PNG_BASE64}`);
    });
  });

  it('should log how long the build took in verbose mode', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const logs = spyOnLogs('log');
    await withServer(
      'single',
      async () => {
        await fetch(`http://localhost:${port}/`);
      },
      true
    );
    expect(logs.some(/Bundle ready \(\d+ms\)/)).toBe(true);
  });

  it('should report 503 and log the failure when the instrument does not compile', async () => {
    const errors = spyOnLogs('error');
    await withServer('single', async () => {
      const res = await fetch(`http://localhost:${port}/`);
      expect(res.status).toBe(503);
    });
    expect(errors.some(/Failed to compile instrument/)).toBe(true);
  });

  it('should log a non-Error bundler rejection as-is, so an odd failure is still reported', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    vi.mocked(bundle).mockRejectedValueOnce('plain failure');
    const errors = spyOnLogs('error');
    await withServer('single', async () => {
      await fetch(`http://localhost:${port}/`);
    });
    expect(errors.some(/plain failure/)).toBe(true);
  });

  it('should serve the runtime manifest, so instruments can resolve runtime imports', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    await withServer('single', async () => {
      const res = await fetch(`http://localhost:${port}/runtime/v1/${MANIFEST_FILENAME}`);
      expect(res.headers.get('content-type')).toBe('application/json');
      expect(await res.json()).toMatchObject({ sources: expect.any(Array) });
    });
  });

  it('should reject a second stop, since the http server is no longer running', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'single', port, target: tmpDir, verbose: false });
    await server.start();
    await server.stop();
    await expect(server.stop()).rejects.toThrow();
  });
});

describe('Server — all mode', () => {
  it('should list discovered instruments on the index page and serve each one', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms', 'happiness'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'forms', 'happiness', 'index.ts'), FORM_SOURCE);
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const indexRes = await fetch(`http://localhost:${port}/`);
      expect(indexRes.status).toBe(200);
      expect(await indexRes.text()).toContain('happiness');

      const instrumentRes = await fetch(`http://localhost:${port}/forms/happiness`);
      expect(instrumentRes.status).toBe(200);
      const instrumentHtml = await instrumentRes.text();
      expect(instrumentHtml).toContain('>forms<');
      expect(instrumentHtml).toContain('>happiness<');
    } finally {
      await server.stop();
    }
  });

  it("should close every discovered instrument's file watcher on stop", async () => {
    for (const name of ['happiness', 'sadness']) {
      fs.mkdirSync(path.join(tmpDir, 'forms', name), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'forms', name, 'index.ts'), FORM_SOURCE);
    }
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    expect(watchCloses).toHaveLength(2);
    await server.stop();
    for (const close of watchCloses) {
      expect(close).toHaveBeenCalledOnce();
    }
  });

  it('should 404 an instrument that was never discovered', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/forms/missing`);
      expect(res.status).toBe(404);
    } finally {
      await server.stop();
    }
  });

  it('should reject a non-GET request with 405', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/`, { method: 'POST' });
      expect(res.status).toBe(405);
    } finally {
      await server.stop();
    }
  });

  it('should 404 a path matching neither the index, an instrument, nor a runtime asset', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/nowhere`);
      expect(res.status).toBe(404);
    } finally {
      await server.stop();
    }
  });

  it('should 404 an unresolvable runtime asset', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    const server = await Server.create({ mode: 'all', port, target: tmpDir, verbose: false });
    await server.start();
    try {
      const res = await fetch(`http://localhost:${port}/runtime/v1/does-not-exist.js`);
      expect(res.status).toBe(404);
    } finally {
      await server.stop();
    }
  });

  it('should ignore a loose file under a kind directory, so only instrument directories are listed', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms', 'happiness'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'forms', 'happiness', 'index.ts'), FORM_SOURCE);
    fs.writeFileSync(path.join(tmpDir, 'forms', 'NOTES.md'), '# notes');
    await withServer('all', async () => {
      const html = await (await fetch(`http://localhost:${port}/`)).text();
      expect(html).toContain('/forms/happiness');
      expect(html).not.toContain('NOTES');
    });
  });

  it('should 404 an instrument that fails to compile and log its key', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms', 'broken'), { recursive: true });
    const errors = spyOnLogs('error');
    await withServer('all', async () => {
      const res = await fetch(`http://localhost:${port}/forms/broken`);
      expect(res.status).toBe(404);
    });
    expect(errors.some(/Failed to compile forms\/broken/)).toBe(true);
  });

  it('should log each request with its status in verbose mode', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    const logs = spyOnLogs('log');
    await withServer(
      'all',
      async () => {
        await fetch(`http://localhost:${port}/nowhere`);
        await vi.waitFor(() => {
          expect(logs.some(/GET \/nowhere 404/)).toBe(true);
        });
      },
      true
    );
  });

  it('should serve the runtime manifest, so instruments can resolve runtime imports', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'), { recursive: true });
    await withServer('all', async () => {
      const res = await fetch(`http://localhost:${port}/runtime/v1/${MANIFEST_FILENAME}`);
      expect(res.headers.get('content-type')).toBe('application/json');
      expect(await res.json()).toMatchObject({ sources: expect.any(Array) });
    });
  });
});
