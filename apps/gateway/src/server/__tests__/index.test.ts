import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../server.development', () => ({ DevelopmentServer: class DevelopmentServer {} }));
vi.mock('../server.production', () => ({ ProductionServer: class ProductionServer {} }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Server', () => {
  it('should be the development server in development, so ssr goes through vite', async () => {
    vi.stubEnv('DEV', true);
    const { Server } = await import('../index');
    const { DevelopmentServer } = await import('../server.development');
    expect(Server).toBe(DevelopmentServer);
  });

  it('should be the production server outside development, so the built client is served', async () => {
    vi.stubEnv('DEV', false);
    const { Server } = await import('../index');
    const { ProductionServer } = await import('../server.production');
    expect(Server).toBe(ProductionServer);
  });
});
