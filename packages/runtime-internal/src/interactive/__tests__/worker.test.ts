import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = (event: unknown) => void;

const ASSET_PATH_PREFIX = '/runtime/v1/@opendatacapture/runtime-internal/interactive';

const listeners = new Map<string, Listener>();

const worker = {
  addEventListener: (type: string, listener: Listener) => listeners.set(type, listener),
  clients: { claim: vi.fn(() => Promise.resolve()) },
  skipWaiting: vi.fn()
};

function dispatch(type: string, event: unknown) {
  const listener = listeners.get(type);
  if (!listener) {
    throw new Error(`No listener registered for '${type}'`);
  }
  listener(event);
}

function loadStaticAssets(staticAssets: { [key: string]: string }) {
  dispatch('message', { data: { staticAssets, type: 'STATIC_ASSETS' }, ports: [] });
}

function fetchAsset(pathname: string) {
  const respondWith = vi.fn<(response: Response) => void>();
  dispatch('fetch', { request: { url: `http://localhost${pathname}` }, respondWith });
  return respondWith;
}

beforeEach(async () => {
  listeners.clear();
  vi.resetModules();
  vi.stubGlobal('self', worker);
  vi.stubGlobal('addEventListener', worker.addEventListener);
  await import('../worker.js');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('lifecycle', () => {
  it('should skip waiting on install, so a new worker takes over without a reload', () => {
    dispatch('install', {});
    expect(worker.skipWaiting).toHaveBeenCalledOnce();
  });

  it('should claim all clients on activate, so the current page is controlled immediately', () => {
    const waitUntil = vi.fn();
    dispatch('activate', { waitUntil });
    expect(worker.clients.claim).toHaveBeenCalledOnce();
    expect(waitUntil).toHaveBeenCalledWith(worker.clients.claim.mock.results[0]?.value);
  });
});

describe('message', () => {
  it('should acknowledge received static assets on the transferred port', () => {
    const postMessage = vi.fn();
    dispatch('message', { data: { staticAssets: {}, type: 'STATIC_ASSETS' }, ports: [{ postMessage }] });
    expect(postMessage).toHaveBeenCalledWith({ type: 'STATIC_ASSETS_READY' });
  });

  it('should ignore messages of another type, so unrelated messages register no assets', () => {
    const postMessage = vi.fn();
    dispatch('message', { data: { staticAssets: { '/a.txt': 'data:text/plain,a' } }, ports: [{ postMessage }] });
    expect(postMessage).not.toHaveBeenCalled();
    expect(fetchAsset('/a.txt')).not.toHaveBeenCalled();
  });
});

describe('fetch', () => {
  it('should respond to a registered base64 image with its decoded bytes', async () => {
    loadStaticAssets({ '/images/foo.png': `data:image/png;base64,${btoa('PNG')}` });
    const response = fetchAsset('/images/foo.png').mock.lastCall?.[0];
    expect(response?.headers.get('Content-Type')).toBe('image/png');
    expect(await response?.text()).toBe('PNG');
  });

  it('should respond to a registered plain text asset with its URI-decoded content', async () => {
    loadStaticAssets({ '/hello.txt': 'data:text/plain,Hello%20World' });
    const response = fetchAsset('/hello.txt').mock.lastCall?.[0];
    expect(response?.headers.get('Content-Type')).toBe('text/plain');
    expect(await response?.text()).toBe('Hello World');
  });

  it('should strip the served runtime prefix, so assets resolve relative to the iframe', async () => {
    loadStaticAssets({ '/hello.txt': 'data:text/plain,hi' });
    const response = fetchAsset(`${ASSET_PATH_PREFIX}/hello.txt`).mock.lastCall?.[0];
    expect(await response?.text()).toBe('hi');
  });

  it('should leave unregistered paths to the network', () => {
    loadStaticAssets({ '/hello.txt': 'data:text/plain,hi' });
    expect(fetchAsset('/other.txt')).not.toHaveBeenCalled();
  });

  it('should throw for an unsupported data URL, so a bad asset fails loudly', () => {
    loadStaticAssets({ '/data.json': 'data:application/json,{}' });
    expect(() => fetchAsset('/data.json')).toThrow('Invalid or unsupported data URL');
  });
});
