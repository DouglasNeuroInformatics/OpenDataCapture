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
      use: { ...devices['Desktop Chrome'], baseURL, channel: 'chromium', headless: true }
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
  // Playwright's own default is half the cores. That many workers log in faster than the API's login
  // throttle allows partway through the suite, and leave a developer's machine little for anything else.
  workers: workerCount ?? (process.env.CI ? 1 : 2)
});
