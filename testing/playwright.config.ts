import * as path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { apiPort, baseURL, gatewayPort, webPort } from './src/support/env';

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
    },
    {
      // Firefox is a cross-browser smoke check: only the `@smoke`-tagged critical flows.
      dependencies: ['setup'],
      grep: /@smoke/,
      name: 'firefox',
      testMatch: '**/specs/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'], baseURL, headless: true }
    }
  ],
  reporter: [['html', { open: 'never', outputFolder: path.resolve(import.meta.dirname, '.playwright/report') }]],
  testDir: path.resolve(import.meta.dirname, 'src'),
  webServer: [
    {
      ...webServerDefaults,
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../apps/api'),
      url: `http://localhost:${apiPort}/v1/setup`
    },
    {
      ...webServerDefaults,
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../apps/gateway'),
      url: `http://localhost:${gatewayPort}/api/healthcheck`
    },
    {
      ...webServerDefaults,
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../apps/web'),
      url: `http://localhost:${webPort}`
    }
  ],
  workers: process.env.CI ? 1 : undefined
});
