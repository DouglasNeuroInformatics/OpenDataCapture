import type { $LoginCredentials } from '@opendatacapture/schemas/auth';

import { groups, initAppOptions, users } from '../helpers/data';
import { expect, test } from '../helpers/fixtures';

import type { TestDataMap } from '../helpers/types';

test.describe.serial(() => {
  test.describe.serial('setup', () => {
    test('should initially not be setup', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: false });
    });
    test('should successfully setup', async ({ getPageModel }) => {
      const setupPage = getPageModel('/setup');
      await setupPage.goto('/setup');
      await setupPage.fillSetupForm(initAppOptions);
      await setupPage.expect.toHaveURL('/auth/login');
    });
    test('should be setup after initialization', async ({ request }) => {
      const response = await request.get('/api/v1/setup');
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ isSetup: true });
    });
    test('should redirect to login page if setup', async ({ page }) => {
      await page.goto('/setup');
      await expect(page).toHaveURL('/auth/login');
    });
    test('should block any further setup requests', async ({ request }) => {
      const response = await request.post('/api/v1/setup', {
        data: initAppOptions
      });
      expect(response.status()).toBe(403);
    });
  });
  test.describe.serial('auth', () => {
    test('should login with the admin credentials', async ({ request }) => {
      const { password, username } = initAppOptions.admin;
      const response = await request.post('/api/v1/auth/login', {
        data: { password, username } satisfies $LoginCredentials
      });
      expect(response.status()).toBe(200);
      const { accessToken } = await response.json();
      expect(typeof accessToken).toBe('string');
      process.env.ADMIN_ACCESS_TOKEN = accessToken;
      process.env.ADMIN_USERNAME = username;
      process.env.ADMIN_PASSWORD = password;
    });
  });

  test.describe.serial('creating groups', () => {
    test('creating groups', async ({ request }) => {
      const createdGroupIds = {} as TestDataMap<string>;
      for (const browser in groups) {
        const response = await request.post('/api/v1/groups', {
          data: groups[browser as keyof typeof groups],
          headers: {
            Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`
          }
        });
        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data).toMatchObject({ id: expect.any(String) });
        createdGroupIds[browser as keyof typeof groups] = data.id;
      }

      for (const key in users) {
        const response = await request.post('/api/v1/users', {
          data: {
            ...users[key as keyof typeof groups],
            groupIds: [createdGroupIds[key as keyof typeof users]]
          },
          headers: {
            Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`
          }
        });
        expect(response.status()).toBe(201);
      }
    });
  });
});
