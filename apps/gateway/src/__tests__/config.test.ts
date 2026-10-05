import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API_KEY = 'k'.repeat(32);

async function loadConfig() {
  vi.resetModules();
  const { config } = await import('../config');
  return config;
}

describe('config', () => {
  beforeEach(() => {
    vi.stubEnv('GATEWAY_API_KEY', API_KEY);
    vi.stubEnv('GATEWAY_DEV_SERVER_PORT', '3500');
    vi.stubEnv('GATEWAY_PROD_SERVER_PORT', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should listen on the dev server port in development mode', async () => {
    await expect(loadConfig()).resolves.toMatchObject({ apiKey: API_KEY, port: 3500 });
  });

  it('should refuse to start in development mode without a dev server port', async () => {
    vi.stubEnv('GATEWAY_DEV_SERVER_PORT', undefined);
    await expect(loadConfig()).rejects.toThrow('Server port must be specified in development mode!');
  });

  it('should listen on port 80 in production mode when no production port is set', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    vi.stubEnv('GATEWAY_DEV_SERVER_PORT', undefined);
    await expect(loadConfig()).resolves.toMatchObject({ port: 80 });
  });

  it('should listen on the production port in production mode, ignoring the dev server port', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    vi.stubEnv('GATEWAY_PROD_SERVER_PORT', '8080');
    await expect(loadConfig()).resolves.toMatchObject({ port: 8080 });
  });

  it('should refuse to start with an API key shorter than 32 characters, so the key cannot be guessed', async () => {
    vi.stubEnv('GATEWAY_API_KEY', 'short');
    await expect(loadConfig()).rejects.toThrow();
  });

  it('should resolve the root to the gateway app directory', async () => {
    await expect(loadConfig()).resolves.toMatchObject({ root: path.resolve(import.meta.dirname, '../..') });
  });
});
