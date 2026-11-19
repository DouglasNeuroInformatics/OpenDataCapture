import { gatewayRefreshInterval, gatewayURL } from '../support/env';
import { expect, test } from '../support/fixtures';

/**
 * admin-settings.spec.ts turns French off for a moment. The API pushes setup state at the start of
 * each sync pass and starts the next pass one GATEWAY_REFRESH_INTERVAL after the previous one ends,
 * so the gateway can hold that state for the rest of a pass plus an interval, and a pass is slow
 * locally under fullyParallel.
 */
const STALE_SETUP_STATE_TIMEOUT = 3 * gatewayRefreshInterval;

test.describe('gateway landing page', () => {
  test.describe.configure({ timeout: STALE_SETUP_STATE_TIMEOUT + 30_000 });

  // The raw response body shows the server rendered French. The client must then hydrate in French
  // too, or React recovers from the mismatch by re-rendering in English; the shell only becomes
  // visible after that, in Root's post-hydration effect, so the visible heading is the final one.
  test('should render a requested active language on the server and keep it through hydration', async ({ page }) => {
    await expect(async () => {
      const french = await page.goto(`${gatewayURL}/?lang=fr`);
      expect(await french!.text()).toContain('Bienvenue');
    }).toPass({ timeout: STALE_SETUP_STATE_TIMEOUT });
    const landing = page.getByTestId('gateway-landing');
    await expect(landing).toBeVisible();
    await expect(landing.getByRole('heading')).toHaveText('Bienvenue');
  });
});
