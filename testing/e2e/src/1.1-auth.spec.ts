import { expect, test } from './helpers/fixtures';

// no need to test the actual login here as it is tested on every other page

test.describe('redirects', () => {
  test('should redirect to login page from the index page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
  });
});
