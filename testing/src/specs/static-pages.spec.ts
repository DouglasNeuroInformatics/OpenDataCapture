import type { SetupState } from '@opendatacapture/schemas/setup';

import { AboutPage } from '../pages/_app/about.page';
import { contactEmail } from '../support/env';
import { expect, test } from '../support/fixtures';

test.describe('about', () => {
  // The uptime is fetched when the page opens rather than reusing the value cached on app load. The
  // router keeps the About match cached for five minutes, so a quick revisit is where a stale uptime
  // would survive; the API's response is rewritten to stand in for a restart between visits.
  test('should show live release and uptime information for the web client, API and gateway on every visit', async ({
    getPageModel,
    page
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.sidebar).toBeVisible();
    const setupResponse = page.waitForResponse(
      (response) => new URL(response.url()).pathname.endsWith('/v1/setup') && response.request().method() === 'GET'
    );
    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    await page.getByTestId('user-dropup-about').click();
    const { uptime } = (await (await setupResponse).json()) as SetupState;

    const aboutPage = new AboutPage(page);
    await expect(aboutPage.pageHeader).toContainText('Platform Information');
    await expect(aboutPage.platformTitle).toBeVisible();
    await expect(aboutPage.webClientInfo).toContainText('Version:');
    await expect(aboutPage.coreApiInfo).toContainText('Version:');
    // The gateway is enabled in every dev/test environment (GATEWAY_ENABLED in .env), so its
    // healthcheck should have resolved rather than the section only reflecting the config flag.
    await expect(aboutPage.gatewayInfo).toContainText('Enabled: Yes');
    await expect(aboutPage.gatewayInfo).toContainText('Status: 200');
    await expect(aboutPage.coreApiInfo).toContainText('Uptime:');
    expect(await aboutPage.getCoreApiUptimeSeconds()).toBeGreaterThanOrEqual(uptime);

    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
    const restartedUptime = 100 * 3600;
    await page.route('**/v1/setup', async (route) => {
      const response = await route.fetch();
      const setupState = (await response.json()) as SetupState;
      await route.fulfill({ json: { ...setupState, uptime: restartedUptime }, response });
    });
    await page.goForward();
    await expect(aboutPage.coreApiInfo).toContainText('Uptime: 100:00:0');
  });
});

test.describe('contact', () => {
  // The page never renders the contact address as visible text; it only surfaces in the mailto link
  // a submission opens, so that link is the one place worth asserting the configured address reaches.
  test('should open a mailto link to the configured contact address on submit', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const message = `Test message ${uniqueId}`;
    const contactPage = await getPageModel('/contact');
    await contactPage.captureMailtoLink();
    await contactPage.selectReason('Bug Report');
    await contactPage.messageField.fill(message);
    await contactPage.submitButton.click();

    const mailtoLink = await (await page.waitForFunction(() => window.__capturedMailto)).jsonValue();
    expect(mailtoLink).toContain(`mailto:${contactEmail}`);
    expect(mailtoLink).toContain(encodeURIComponent(message));
  });
});
