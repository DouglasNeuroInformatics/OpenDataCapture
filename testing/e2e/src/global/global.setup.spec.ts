/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { LoginCredentials } from '@opendatacapture/schemas/auth';
import type { InitAppOptions } from '@opendatacapture/schemas/setup';
import { expect, test } from '@playwright/test';

const initOptions: InitAppOptions = {
  admin: {
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'DataCapture2025',
    username: 'admin'
  },
  enableExperimentalFeatures: false,
  initDemo: true
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_ACCESS_TOKEN: string;
      ADMIN_PASSWORD: string;
      ADMIN_USERNAME: string;
      GLOBAL_SETUP_COMPLETE?: '1';
    }
  }
}

test.skip(() => process.env.GLOBAL_SETUP_COMPLETE === '1');

test.describe.serial(() => {
  test.describe.serial('setup', () => {
    test('initial setup', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: false });
    });
    test('successful setup', async ({ request }) => {
      const response = await request.post('/api/v1/setup', {
        data: initOptions
      });
      expect(response.status()).toBe(201);
      await expect(response.json()).resolves.toStrictEqual({ success: true });
    });
    test('setup state after initialization', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: true });
    });
  });
  test.describe.serial('auth', () => {
    test('login', async ({ request }) => {
      const { password, username } = initOptions.admin;
      const response = await request.post('/api/v1/auth/login', {
        data: { password, username } satisfies LoginCredentials
      });
      expect(response.status()).toBe(200);
      const { accessToken } = await response.json();
      expect(typeof accessToken).toBe('string');
      process.env.ADMIN_ACCESS_TOKEN = accessToken;
      process.env.ADMIN_USERNAME = username;
      process.env.ADMIN_PASSWORD = password;
      process.env.GLOBAL_SETUP_COMPLETE = '1';
    });
  });
});
