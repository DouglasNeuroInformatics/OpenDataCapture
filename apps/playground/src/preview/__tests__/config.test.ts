import { afterEach, describe, expect, it, vi } from 'vitest';

import { $PlaygroundConfig, fetchPlaygroundConfig } from '../config';

const respondWith = (body: BodyInit, init?: ResponseInit) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(body, init)))
  );
};

describe('$PlaygroundConfig', () => {
  it('should accept an empty preview origin, which is what Caddy serves when the variable is unset', () => {
    expect($PlaygroundConfig.safeParse({ previewOrigin: '' }).success).toBe(true);
  });

  it('should reject a preview origin that is not an http url, rather than frame an arbitrary scheme', () => {
    expect($PlaygroundConfig.safeParse({ previewOrigin: 'preview.example.org' }).success).toBe(false);
    expect($PlaygroundConfig.safeParse({ previewOrigin: 'javascript:alert(1)' }).success).toBe(false);
  });
});

describe('fetchPlaygroundConfig', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return the preview origin the server was started with', async () => {
    respondWith(JSON.stringify({ previewOrigin: 'https://preview.example.org' }));
    await expect(fetchPlaygroundConfig()).resolves.toStrictEqual({ previewOrigin: 'https://preview.example.org' });
  });

  it('should throw when the config is missing, so a host that does not serve it fails loudly', async () => {
    respondWith('Not Found', { status: 404, statusText: 'Not Found' });
    await expect(fetchPlaygroundConfig()).rejects.toThrow('404');
  });

  it('should throw when a fallback serves the editor page in its place, rather than read it as unconfigured', async () => {
    respondWith('<!doctype html>', { headers: { 'Content-Type': 'text/html' } });
    await expect(fetchPlaygroundConfig()).rejects.toThrow();
  });
});
