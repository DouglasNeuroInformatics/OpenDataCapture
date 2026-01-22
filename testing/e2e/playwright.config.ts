import * as path from 'node:path';

import { parseNumber, range, unwrap } from '@douglasneuroinformatics/libjs';
import { defineConfig, devices } from '@playwright/test';
import type { Project } from '@playwright/test';

import type { BrowserTarget, ProjectMetadata } from './src/helpers/types';

const apiPort = parseNumber(process.env.API_DEV_SERVER_PORT);
const gatewayPort = parseNumber(process.env.GATEWAY_DEV_SERVER_PORT);
const webPort = parseNumber(process.env.WEB_DEV_SERVER_PORT);

if (Number.isNaN(apiPort)) {
  throw new Error(`Expected API_DEV_SERVER_PORT to be number, got ${process.env.API_DEV_SERVER_PORT}`);
} else if (!gatewayPort) {
  throw new Error(`Expected GATEWAY_DEV_SERVER_PORT to be number, got ${process.env.GATEWAY_DEV_SERVER_PORT}`);
} else if (Number.isNaN(webPort)) {
  throw new Error(`Expected WEB_DEV_SERVER_PORT to be number, got ${process.env.WEB_DEV_SERVER_PORT}`);
}

const baseURL = `http://localhost:${webPort}`;

const browsers: { target: BrowserTarget; use: Project['use'] }[] = [
  { target: 'Desktop Chrome', use: { ...devices['Desktop Chrome'], channel: 'chromium', headless: true } },
  { target: 'Desktop Firefox', use: { ...devices['Desktop Firefox'], headless: true } }
] as const;

export default defineConfig({
  globalSetup: path.resolve(import.meta.dirname, 'src/global/global.setup.ts'),
  globalTeardown: path.resolve(import.meta.dirname, 'src/global/global.teardown.ts'),
  maxFailures: 1,
  outputDir: path.resolve(import.meta.dirname, '.playwright/output'),
  projects: [
    {
      name: 'Global Setup',
      teardown: 'Global Teardown',
      testMatch: '**/global/global.setup.spec.ts',
      use: {
        baseURL
      }
    },
    {
      name: 'Global Teardown',
      testMatch: '**/global/global.teardown.spec.ts',
      use: {
        baseURL
      }
    },
    ...unwrap(range(1, 4)).flatMap((i) => {
      return browsers.map((browser) => {
        return {
          dependencies: i === 1 ? ['Global Setup'] : [`${i - 1}.x - ${browser.target}`],
          metadata: {
            browserTarget: browser.target
          } satisfies ProjectMetadata,
          name: `${i}.x - ${browser.target}`,
          testMatch: `**/${i}.*.spec.ts`,
          use: {
            ...browser.use,
            baseURL
          }
        };
      });
    })
  ],
  reporter: [['html', { open: 'never', outputFolder: path.resolve(import.meta.dirname, '.playwright/report') }]],
  testDir: path.resolve(import.meta.dirname, 'src'),
  webServer: [
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/api'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      stderr: 'pipe',
      stdout: process.env.CI ? 'pipe' : 'ignore',
      timeout: 10_000,
      url: `http://localhost:${apiPort}/v1/setup`
    },
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/gateway'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      stderr: 'pipe',
      stdout: process.env.CI ? 'pipe' : 'ignore',
      timeout: 10_000,
      url: `http://localhost:${gatewayPort}/api/healthcheck`
    },
    {
      command: 'pnpm dev:test',
      cwd: path.resolve(import.meta.dirname, '../../apps/web'),
      gracefulShutdown: {
        signal: 'SIGINT',
        timeout: 1000
      },
      stderr: 'pipe',
      stdout: process.env.CI ? 'pipe' : 'ignore',
      timeout: 10_000,
      url: `http://localhost:${webPort}`
    }
  ],
  workers: process.env.CI ? 1 : undefined
});
