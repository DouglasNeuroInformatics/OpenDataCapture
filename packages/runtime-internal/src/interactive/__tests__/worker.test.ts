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
  const respondWith = vi.fn<(response: Promise<Response>) => void>();
  dispatch('fetch', { request: { url: `http://localhost${pathname}` }, respondWith });
  return respondWith;
}

describe('worker', () => {
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
      const response = await fetchAsset('/images/foo.png').mock.lastCall?.[0];
      expect(response?.headers.get('Content-Type')).toBe('image/png');
      expect(await response?.text()).toBe('PNG');
    });

    it('should respond to a registered plain text asset with its URI-decoded content', async () => {
      loadStaticAssets({ '/hello.txt': 'data:text/plain,Hello%20World' });
      const response = await fetchAsset('/hello.txt').mock.lastCall?.[0];
      expect(response?.headers.get('Content-Type')).toBe('text/plain');
      expect(await response?.text()).toBe('Hello World');
    });

    it('should serve every data URL the bundler emits, so svg, mp3 and mp4 static assets load', async () => {
      // esbuild 0.28 emits SVG as percent-encoded text that escapes '#' but leaves a bare '%' as is
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="100%" fill="#f00"/></svg>';
      const svgDataUrl = `data:image/svg+xml,${svg.replace('#', '%23')}`;
      const mp3 = String.fromCharCode(0xff, 0xfb, 0x90, 0x44, 0x00);
      const mp4 = `${String.fromCharCode(0x00, 0x00, 0x00, 0x18)}ftypisom`;
      loadStaticAssets({
        '/clip.mp4': `data:application/octet-stream;base64,${btoa(mp4)}`,
        '/icon.svg': svgDataUrl,
        '/tone.mp3': `data:audio/mpeg;base64,${btoa(mp3)}`,
        '/video.mp4': `data:video/mp4;base64,${btoa(mp4)}`
      });
      const bytesOf = (s: string) => Array.from(s, (c) => c.charCodeAt(0));

      const svgResponse = await fetchAsset('/icon.svg').mock.lastCall?.[0];
      expect(svgResponse?.headers.get('Content-Type')).toBe('image/svg+xml');
      expect(await svgResponse?.text()).toBe(svg);

      const mp3Response = await fetchAsset('/tone.mp3').mock.lastCall?.[0];
      expect(mp3Response?.headers.get('Content-Type')).toBe('audio/mpeg');
      expect(Array.from(new Uint8Array(await mp3Response!.arrayBuffer()))).toEqual(bytesOf(mp3));

      const mp4Response = await fetchAsset('/video.mp4').mock.lastCall?.[0];
      expect(mp4Response?.headers.get('Content-Type')).toBe('video/mp4');
      expect(Array.from(new Uint8Array(await mp4Response!.arrayBuffer()))).toEqual(bytesOf(mp4));

      const octetResponse = await fetchAsset('/clip.mp4').mock.lastCall?.[0];
      expect(octetResponse?.headers.get('Content-Type')).toBe('application/octet-stream');
      expect(Array.from(new Uint8Array(await octetResponse!.arrayBuffer()))).toEqual(bytesOf(mp4));
    });

    it('should strip the served runtime prefix, so assets resolve relative to the iframe', async () => {
      loadStaticAssets({ '/hello.txt': 'data:text/plain,hi' });
      const response = await fetchAsset(`${ASSET_PATH_PREFIX}/hello.txt`).mock.lastCall?.[0];
      expect(await response?.text()).toBe('hi');
    });

    it('should leave unregistered paths to the network', () => {
      loadStaticAssets({ '/hello.txt': 'data:text/plain,hi' });
      expect(fetchAsset('/other.txt')).not.toHaveBeenCalled();
    });

    it('should reject a static asset that is not a data URL, so that request fails instead of reaching the server', async () => {
      loadStaticAssets({ '/foo.png': 'https://example.com/foo.png' });
      const respondWith = fetchAsset('/foo.png');
      expect(respondWith).toHaveBeenCalledOnce();
      await expect(respondWith.mock.lastCall?.[0]).rejects.toThrow('Static asset is not a data URL');
    });
  });
});
