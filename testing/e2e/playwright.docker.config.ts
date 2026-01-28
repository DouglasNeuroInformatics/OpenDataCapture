import * as crypto from 'node:crypto';
import * as path from 'node:path';

import { parseNumber, range, unwrap } from '@douglasneuroinformatics/libjs';
import { defineConfig, devices } from '@playwright/test';
import type { Project } from '@playwright/test';

import { AUTH_STORAGE_DIR } from './src/helpers/constants';

import type { BrowserTarget, ProjectMetadata } from './src/helpers/types';

console.log(process.env.APP_PORT);

const appPort = parseNumber(process.env.APP_PORT);
const gatewayPort = parseNumber(process.env.GATEWAY_PORT);

if (Number.isNaN(appPort)) {
  throw new Error(`Expected APP_PORT to be number, got ${process.env.APP_PORT}`);
} else if (Number.isNaN(gatewayPort)) {
  throw new Error(`Expected GATEWAY_PORT to be number, got ${process.env.GATEWAY_PORT}`);
}

const baseURL = `http://localhost:${appPort}`;

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
        const browserId = crypto.createHash('sha256').update(browser.target).digest('hex');
        return {
          dependencies: i === 1 ? ['Global Setup'] : [`${i - 1}.x - ${browser.target}`],
          metadata: {
            authStorageFile: path.resolve(AUTH_STORAGE_DIR, `${browserId}.json`),
            browserId,
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
      command: 'true', // Dummy command since services are assumed running in Docker
      url: `http://localhost:${appPort}/api/v1/setup`,
      timeout: 10_000
    },
    {
      command: 'true', // Dummy command since services are assumed running in Docker
      url: `http://localhost:${gatewayPort}/api/healthcheck`,
      timeout: 10_000
    },
    {
      command: 'true', // Dummy command since services are assumed running in Docker
      url: `http://localhost:${appPort}`,
      timeout: 10_000
    }
  ],
  workers: process.env.CI ? 1 : undefined
});
