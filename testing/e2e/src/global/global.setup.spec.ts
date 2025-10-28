import type { LoginCredentials } from '@opendatacapture/schemas/auth';

import { initAppOptions } from '../helpers/data';
import { expect, test } from '../helpers/fixtures';

test.skip(() => process.env.GLOBAL_SETUP_COMPLETE === '1');

test.describe.serial(() => {
  test.describe.serial('setup', () => {
    test('initial setup', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: false });
    });
    test('successful setup', async ({ setupPage }) => {
      await setupPage.fillSetupForm(initAppOptions);
      await setupPage.expect.toHaveURL('/dashboard');
    });
    test('setup state after initialization', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: true });
    });
  });
  test.describe.serial('auth', () => {
    test('login', async ({ request }) => {
      const { password, username } = initAppOptions.admin;
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
