import { gatewayURL } from '../support/env';
import { expect, test } from '../support/fixtures';

test.describe('gateway landing page', () => {
  // The raw response body shows the server rendered French. The client must then hydrate in French
  // too, or React recovers from the mismatch by re-rendering in English; the shell only becomes
  // visible after that, in Root's post-hydration effect, so the visible heading is the final one.
  test('should render a requested active language on the server and keep it through hydration', async ({ page }) => {
    const french = await page.goto(`${gatewayURL}/?lang=fr`);
    expect(await french!.text()).toContain('Bienvenue');
    const landing = page.getByTestId('gateway-landing');
    await expect(landing).toBeVisible();
    await expect(landing.getByRole('heading')).toHaveText('Bienvenue');
  });
});
