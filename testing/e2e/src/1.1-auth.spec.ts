import { users } from './helpers/data';
import { expect, test } from './helpers/fixtures';

import type { ProjectAuth } from './helpers/types';

test.describe('redirects', () => {
  test('should redirect to login page from the index page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('login page', () => {
  test('should allow logging in', async ({ getPageModel, getProjectMetadata, setProjectAuth }) => {
    const credentials = users[getProjectMetadata('browserTarget')];
    const loginPage = await getPageModel('/auth/login');
    const loginResponsePromise = loginPage.$ref.waitForResponse((response) => {
      return response.url().endsWith('/v1/auth/login') && response.status() === 200;
    });

    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');

    const response = await loginResponsePromise;
    const body = await response.json();
    expect(typeof body.accessToken).toBe('string');
    setProjectAuth({ accessToken: body.accessToken as string } satisfies ProjectAuth);
  });
});
