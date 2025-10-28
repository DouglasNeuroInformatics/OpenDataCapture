import type { LoginCredentials } from '@opendatacapture/schemas/auth';
import { expect, test } from '@playwright/test';

import { initAppOptions } from '../helpers/data';

test.skip(() => process.env.GLOBAL_SETUP_COMPLETE === '1');

test.describe.serial(() => {
  test.describe.serial('setup', () => {
    test('initial setup', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: false });
    });
    test('successful setup', async ({ page }) => {
      await page.goto('/setup');
      await expect(page).toHaveURL('/setup');
      const setupForm = page.locator('form[data-cy="setup-form"]');
      await setupForm.locator('input[name="firstName"]').fill(initAppOptions.admin.firstName);
      await setupForm.locator('input[name="lastName"]').fill(initAppOptions.admin.lastName);
      await setupForm.locator('input[name="username"]').fill(initAppOptions.admin.username);
      await setupForm.locator('input[name="password"]').fill(initAppOptions.admin.password);
      await setupForm.locator('input[name="confirmPassword"]').fill(initAppOptions.admin.password);
      await setupForm.locator('#initDemo-true').click();
      await setupForm.locator('input[name="dummySubjectCount"]').fill(initAppOptions.dummySubjectCount.toString());
      await setupForm.locator('input[name="recordsPerSubject"]').fill(initAppOptions.recordsPerSubject.toString());
      await setupForm.getByLabel('Submit').click();
      await expect(page).toHaveURL('/dashboard');
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
