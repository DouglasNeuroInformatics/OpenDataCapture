import { gatewayURL } from '../support/env';
import { expect, test } from '../support/fixtures';

test.describe('gateway landing page', () => {
  test('should point a patient who opens the gateway root to the link they were sent', async ({ page }) => {
    const response = await page.goto(gatewayURL);
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('gateway-landing')).toContainText('open the secure link you were sent');
  });

  // As with an assignment, `?lang=` must be honoured in the SSR'd HTML rather than swapped in after
  // hydration, which only the raw response body distinguishes.
  test('should render server-side in a requested active language', async ({ page }) => {
    // admin-settings.spec.ts turns French off for a moment, and the gateway keeps whatever setup
    // state it was last pushed for a whole GATEWAY_REFRESH_INTERVAL, so ride out one stale push.
    await expect(async () => {
      const french = await page.goto(`${gatewayURL}/?lang=fr`);
      expect(await french!.text()).toContain('Bienvenue');
    }).toPass({ timeout: 30_000 });
  });
});
