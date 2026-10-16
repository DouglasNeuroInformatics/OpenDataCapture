import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const REQUIRED_ENV = {
  API_BASE_URL: '/api',
  CONTACT_EMAIL: 'support@example.org',
  DOCS_URL: 'https://docs.example.org',
  GATEWAY_ENABLED: 'true',
  GITHUB_REPO_URL: 'https://github.com/example/repo',
  LICENSE_URL: 'https://example.org/license'
};

const OPTIONAL_ENV = [
  'VITE_DEV_BYPASS_AUTH',
  'VITE_DEV_DISABLE_TUTORIAL',
  'VITE_DEV_FORCE_CLEAR_QUERY_CACHE',
  'VITE_DEV_NETWORK_LATENCY',
  'VITE_DEV_PASSWORD',
  'VITE_DEV_USERNAME'
];

/** The config is parsed once at module load, so each test needs a fresh module to see its env. */
const loadConfig = async () => {
  vi.resetModules();
  const { config } = await import('@/config');
  return config;
};

describe('config', () => {
  beforeEach(() => {
    Object.entries(REQUIRED_ENV).forEach(([name, value]) => vi.stubEnv(name, value));
    OPTIONAL_ENV.forEach((name) => vi.stubEnv(name, undefined));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should read the instance metadata and setup from the environment', async () => {
    const config = await loadConfig();
    expect(config.meta).toEqual({
      contactEmail: 'support@example.org',
      docsUrl: 'https://docs.example.org',
      githubRepoUrl: 'https://github.com/example/repo',
      licenseUrl: 'https://example.org/license'
    });
    expect(config.setup).toEqual({ apiBaseUrl: '/api', isGatewayEnabled: true });
  });

  it('should coerce the string-valued development options into booleans and numbers', async () => {
    vi.stubEnv('VITE_DEV_BYPASS_AUTH', 'true');
    vi.stubEnv('VITE_DEV_DISABLE_TUTORIAL', 'false');
    vi.stubEnv('VITE_DEV_NETWORK_LATENCY', '250');
    const config = await loadConfig();
    expect(config.dev).toMatchObject({ disableTutorial: false, isBypassAuthEnabled: true, networkLatency: 250 });
  });

  it('should fail to load with an invalid value, so a misconfigured deployment does not start', async () => {
    vi.stubEnv('CONTACT_EMAIL', 'not-an-email');
    await expect(loadConfig()).rejects.toMatchObject({
      issues: [expect.objectContaining({ path: ['meta', 'contactEmail'] })],
      name: 'ZodError'
    });
  });

  it('should freeze the parsed config, so nothing can change it at runtime', async () => {
    const config = await loadConfig();
    expect(Object.isFrozen(config.meta)).toBe(true);
  });
});
