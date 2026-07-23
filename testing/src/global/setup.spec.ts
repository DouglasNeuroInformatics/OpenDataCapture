import { expect, test } from '@playwright/test';

import { SetupPage } from '../pages/setup.page';
import { INIT_APP_OPTIONS } from '../support/constants';

// Runs once before every other project (they `dependOn` it). Uses the raw Playwright fixtures — not
// the extended `test` — because the app has no admin to authenticate as until this completes.
test.describe.serial('setup', () => {
  test('should not be set up initially', async ({ request }) => {
    const response = await request.get('/api/v1/setup');
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ isSetup: false });
  });

  test('should complete setup through the UI', async ({ page }) => {
    const setupPage = new SetupPage(page);
    await setupPage.goto('/setup');
    await setupPage.fillSetupForm(INIT_APP_OPTIONS);
    // Setup seeds demo data plus dummy records before redirecting; on a cold CI runner this
    // legitimately takes far longer than the default timeout.
    await setupPage.expect.toHaveURL('/auth/login', { timeout: 90_000 });
  });

  test('should be set up afterward', async ({ request }) => {
    const response = await request.get('/api/v1/setup');
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ isSetup: true });
  });

  test('should redirect /setup to login once set up', async ({ page }) => {
    await page.goto('/setup');
    await expect(page).toHaveURL('/auth/login');
  });

  test('should block further setup requests', async ({ request }) => {
    const response = await request.post('/api/v1/setup', { data: INIT_APP_OPTIONS });
    expect(response.status()).toBe(403);
  });
});
