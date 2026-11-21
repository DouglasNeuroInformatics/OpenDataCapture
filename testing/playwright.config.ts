import * as path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import {
  apiPort,
  baseURL,
  gatewayPort,
  gatewayRefreshInterval,
  playgroundPort,
  webPort,
  workerCount
} from './src/support/env';

const webServerDefaults = {
  gracefulShutdown: { signal: 'SIGINT', timeout: 1000 },
  stderr: 'pipe',
  stdout: process.env.CI ? 'pipe' : 'ignore',
  timeout: 10_000
} as const;

export default defineConfig({
  // The default 5s assertion timeout is too tight for a 2-core CI runner doing real DB work
  // (session creation, seeding). Heavier one-off operations set their own longer timeout inline.
  expect: {
    timeout: 15_000
  },
  fullyParallel: true,
  outputDir: path.resolve(import.meta.dirname, '.playwright/output'),
  projects: [
    { name: 'setup', teardown: 'teardown', testMatch: '**/global/setup.spec.ts', use: { baseURL } },
    { name: 'teardown', testMatch: '**/global/teardown.spec.ts', use: { baseURL } },
    {
      dependencies: ['setup'],
      name: 'chromium',
      testMatch: '**/specs/**/*.spec.ts',
      // `locale` is pinned because the gateway negotiates the language of a link that carries none
      // from Accept-Language, which a browser derives from its locale: left to the host's, every
      // assertion on an English string would depend on the developer's own machine. A test about
      // that negotiation opts into another locale with its own `browser.newContext({ locale })`.
      use: { ...devices['Desktop Chrome'], baseURL, channel: 'chromium', headless: true, locale: 'en-US' }
    }
  ],
  reporter: [['html', { open: 'never', outputFolder: path.resolve(import.meta.dirname, '.playwright/report') }]],
  testDir: path.resolve(import.meta.dirname, 'src'),
  // The gateway, web and playground serve their production builds, which turbo builds before the
  // suite: a dev server holds every module it has transformed in memory and serves each unbundled.
  webServer: [
    {
      ...webServerDefaults,
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../apps/api'),
      env: { GATEWAY_REFRESH_INTERVAL: String(gatewayRefreshInterval) },
      url: `http://localhost:${apiPort}/v1/setup`
    },
    {
      ...webServerDefaults,
      command: 'pnpm start',
      cwd: path.resolve(import.meta.dirname, '../apps/gateway'),
      env: { GATEWAY_PROD_SERVER_PORT: String(gatewayPort) },
      url: `http://localhost:${gatewayPort}/api/healthcheck`
    },
    {
      ...webServerDefaults,
      command: 'pnpm preview',
      cwd: path.resolve(import.meta.dirname, '../apps/web'),
      url: `http://localhost:${webPort}`
    },
    {
      ...webServerDefaults,
      command: 'pnpm preview',
      cwd: path.resolve(import.meta.dirname, '../apps/playground'),
      url: `http://localhost:${playgroundPort}`
    }
  ],
  // Playwright's own default is half the cores. Each worker is a Chromium beside the four servers, so
  // memory runs out long before the cores do: two workers already peak near 7 GB.
  workers: workerCount ?? (process.env.CI ? 1 : 2)
});
