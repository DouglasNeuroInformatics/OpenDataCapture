import * as path from 'node:path';

import { parseNumber } from '@douglasneuroinformatics/libjs';
import { defineConfig, devices } from '@playwright/test';

const API_PORT = parseNumber(process.env.API_DEV_SERVER_PORT);
const GATEWAY_PORT = parseNumber(process.env.GATEWAY_DEV_SERVER_PORT);
const WEB_PORT = parseNumber(process.env.WEB_DEV_SERVER_PORT);

export default defineConfig({
  fullyParallel: true,
  outputDir: path.resolve(import.meta.dirname, '.output/results'),
  projects: [
    {
      name: 'Global Setup',
      teardown: 'Global Teardown',
      testMatch: '**/global/global.setup.spec.ts'
    },
    {
      name: 'Global Teardown',
      testMatch: '**/global/global.teardown.spec.ts'
    },
    {
      dependencies: ['Global Setup'],
      name: 'Desktop Chrome',
      testIgnore: '**/global/**',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      dependencies: ['Global Setup'],
      name: 'Desktop Firefox',
      testIgnore: '**/global/**',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      dependencies: ['Global Setup'],
      name: 'Desktop Safari',
      testIgnore: '**/global/**',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  reporter: [['html', { open: 'never', outputFolder: path.resolve(import.meta.dirname, '.output/report') }]],
  testDir: path.resolve(import.meta.dirname, 'src'),
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/api'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      timeout: 10_000,
      url: `http://localhost:${API_PORT}`
    },
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/gateway'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      timeout: 10_000,
      url: `http://localhost:${GATEWAY_PORT}/api/healthcheck`
    },
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/web'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      timeout: 10_000,
      url: `http://localhost:${WEB_PORT}`
    }
  ]
});
