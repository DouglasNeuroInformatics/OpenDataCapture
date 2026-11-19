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

  // A link is created before anyone knows what its reader speaks, so most carry no `lang` at all.
  // The browser's own Accept-Language is then what decides, server-side, so the first paint is
  // already in their language rather than swapping after hydration.
  test('should open a link with no language in the language the browser asks for', async ({ browser }) => {
    const frenchContext = await browser.newContext({ locale: 'fr-CA' });
    const frenchPage = await frenchContext.newPage();
    await expect(async () => {
      const landing = await frenchPage.goto(gatewayURL);
      expect(await landing!.text()).toContain('Bienvenue');
    }).toPass({ timeout: STALE_SETUP_STATE_TIMEOUT });
    await expect(frenchPage.getByTestId('gateway-landing').getByRole('heading')).toHaveText('Bienvenue');
    await frenchContext.close();
  });

  test('should prefer the language the link names over the one the browser asks for', async ({ browser }) => {
    const frenchContext = await browser.newContext({ locale: 'fr-CA' });
    const frenchPage = await frenchContext.newPage();
    await expect(async () => {
      const english = await frenchPage.goto(`${gatewayURL}/?lang=en`);
      expect(await english!.text()).toContain('Welcome');
    }).toPass({ timeout: STALE_SETUP_STATE_TIMEOUT });
    await frenchContext.close();
  });
});
