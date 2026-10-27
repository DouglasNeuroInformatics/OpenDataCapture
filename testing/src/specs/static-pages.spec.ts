import type { SetupState } from '@opendatacapture/schemas/setup';

import { AboutPage } from '../pages/_app/about.page';
import { contactEmail } from '../support/env';
import { expect, test } from '../support/fixtures';

test.describe('about', () => {
  test('should display web client, API and gateway release information', async ({ getPageModel }) => {
    const aboutPage = await getPageModel('/about');
    await expect(aboutPage.pageHeader).toContainText('Platform Information');
    await expect(aboutPage.platformTitle).toBeVisible();
    await expect(aboutPage.webClientInfo).toContainText('Version:');
    await expect(aboutPage.coreApiInfo).toContainText('Version:');
    // The gateway is enabled in every dev/test environment (GATEWAY_ENABLED in .env), so its
    // healthcheck should have resolved rather than the section only reflecting the config flag.
    await expect(aboutPage.gatewayInfo).toContainText('Enabled: Yes');
    await expect(aboutPage.gatewayInfo).toContainText('Status: 200');
  });

  // Nested under `_app` despite being "static" content, so it shares that layout's auth guard.
  test('should redirect an unauthenticated visitor to login', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('contact', () => {
  test('should display the contact form', async ({ getPageModel }) => {
    const contactPage = await getPageModel('/contact');
    await expect(contactPage.pageHeader).toContainText('Contact Us');
    await expect(contactPage.reasonField).toBeVisible();
    await expect(contactPage.messageField).toBeVisible();
  });

  test('should redirect an unauthenticated visitor to login', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL('/auth/login');
  });

  test('should require a reason and a message before submitting', async ({ getPageModel, page }) => {
    const contactPage = await getPageModel('/contact');
    await contactPage.submitButton.click();

    // Both fields report it: the message textarea, and the reason select — whose unselected value
    // raises an issue code that used to fall through to zod's untranslated default.
    const errorMessages = page.getByTestId('error-message-text');
    await expect(errorMessages.first()).toBeVisible();
    for (const message of await errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
  });

  // The page never renders the contact address as visible text; it only surfaces in the mailto link
  // a submission opens, so that link is the one place worth asserting the configured address reaches.
  test('should open a mailto link to the configured contact address on submit', async ({ getPageModel, uniqueId }) => {
    const message = `Test message ${uniqueId}`;
    const contactPage = await getPageModel('/contact');
    await contactPage.captureMailtoLink();
    await contactPage.selectReason('Bug Report');
    await contactPage.messageField.fill(message);
    await contactPage.submitButton.click();

    await expect(async () => {
      const mailtoLink = await contactPage.getCapturedMailtoLink();
      expect(mailtoLink).toContain(`mailto:${contactEmail}`);
      expect(mailtoLink).toContain(encodeURIComponent(message));
    }).toPass();
  });
});

test.describe('about uptime', () => {
  test('should fetch the API uptime when the page is opened rather than reuse the value cached on app load', async ({
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
    await expect(aboutPage.coreApiInfo).toContainText('Uptime:');
    expect(await aboutPage.getCoreApiUptimeSeconds()).toBeGreaterThanOrEqual(uptime);
  });

  // The router keeps the About match cached for five minutes, so a quick revisit is where a stale
  // uptime would survive; the API's response is rewritten to stand in for a restart between visits.
  test('should show the uptime fetched on a revisit rather than the one from the previous visit', async ({
    getPageModel,
    page
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    const aboutPage = new AboutPage(page);
    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    await page.getByTestId('user-dropup-about').click();
    await expect(aboutPage.coreApiInfo).toContainText('Uptime:');
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

test.describe('about uptime counter', () => {
  test('should show the starting uptime plus the seconds elapsed since the page opened', async ({
    getPageModel,
    page
  }) => {
    await page.clock.install();
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    const aboutMenuItem = page.getByTestId('user-dropup-about');
    await expect(aboutMenuItem).toBeVisible();

    // Paused before About mounts, so the counter's first tick waits for the test to advance a full
    // second; the 10ms steps only flush the zero-delay timers the navigation and its fetch schedule.
    // The target leaves a second's margin because the page clock keeps running while it travels
    // back here, and pauseAt rejects a time that has already passed.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await aboutMenuItem.click();
    const aboutPage = new AboutPage(page);
    await expect(async () => {
      await page.clock.runFor(10);
      await expect(aboutPage.coreApiInfo).toContainText('Uptime:', { timeout: 100 });
    }).toPass();

    const initialUptime = await aboutPage.getCoreApiUptimeSeconds();
    await page.clock.runFor(3000);
    await expect.poll(() => aboutPage.getCoreApiUptimeSeconds()).toBe(initialUptime + 3);
  });
});
