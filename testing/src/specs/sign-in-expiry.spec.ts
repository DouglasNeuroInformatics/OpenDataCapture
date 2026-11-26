import type { Page } from '@playwright/test';

import { DashboardPage } from '../pages/_app/dashboard.page';
import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { StartSessionPage } from '../pages/_app/session/start-session.page';
import { LoginPage } from '../pages/auth/login.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

function waitForResponseTo(page: Page, path: string) {
  return page.waitForResponse((response) => response.url().endsWith(path) && response.request().method() === 'POST');
}

/** How long the API issued this token for, in milliseconds. */
function lifetimeOf(accessToken: string): number {
  const [, payload] = accessToken.split('.');
  if (!payload) {
    throw new Error('Expected a JWT');
  }
  const { exp, iat } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp: number; iat: number };
  return (exp - iat) * 1000;
}

/**
 * Makes the API answer as it does once the token the page holds has expired: 401 to every request
 * carrying a token, until the user signs in again. Waiting out a real token would take the test an
 * hour.
 */
async function expireAccessToken(page: Page): Promise<void> {
  let isExpired = true;
  await page.route('**/v1/**', async (route) => {
    const request = route.request();
    if (request.url().endsWith('/v1/auth/login')) {
      isExpired = false;
    } else if (isExpired && request.headers().authorization) {
      await route.fulfill({
        // The suite's web app calls the API on another port, and a response without this header
        // reaches it as a network failure rather than a 401.
        headers: { 'access-control-allow-origin': '*' },
        json: { message: 'Unauthorized', statusCode: 401 },
        status: 401
      });
      return;
    }
    await route.fallback();
  });
}

/**
 * Starts a session for a new subject and begins the Happiness Questionnaire. The active session
 * lives in memory, so every step navigates via the sidebar.
 */
async function beginInstrument(page: Page, firstName: string): Promise<RenderInstrumentPage> {
  const startSessionPage = new StartSessionPage(page);
  await startSessionPage.goto('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(firstName, `Subject${firstName}`, 'Female');
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();

  await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
  await page.waitForURL('**/instruments/accessible-instruments');

  const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
  await expect(card).toBeVisible();
  await card.click();

  const instrumentPage = new RenderInstrumentPage(page);
  await instrumentPage.begin();
  return instrumentPage;
}

// Every test signs in as a user of its own, whose password it knows: the role accounts the other
// specs share expose a token but no password to give the dialog.
test.describe('sign-in expiry', () => {
  test('should keep an instrument that is being filled in when the token expires, and save it once the user signs in again', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);

    const instrumentPage = await beginInstrument(page, `Expiry${uniqueId}`);
    await instrumentPage.completeHappinessQuestionnaire();
    await expireAccessToken(page);
    await instrumentPage.submit();

    await expect(instrumentPage.reauthenticationDialog).toBeVisible();
    await instrumentPage.signInAgain(credentials.password);
    await expect(instrumentPage.summaryHeading).toBeVisible();
    await expect(page.getByTestId('error-page')).toBeHidden();
  });

  test('should ask for the password, not show the error page, when a tab is shown again after its token expired', async ({
    api,
    authenticateAs,
    page
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.statisticSubjects).toBeVisible();

    await expireAccessToken(page);
    // What the browser fires when the user comes back to the tab, which is when TanStack Query
    // fetches again everything on screen.
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));

    await expect(dashboardPage.reauthenticationDialog).toBeVisible();
    await dashboardPage.signInAgain(credentials.password);
    await expect(dashboardPage.statisticSubjects).toBeVisible();
    await expect(page.getByTestId('error-page')).toBeHidden();
  });

  test('should renew the token while the user is working, so it does not expire under them', async ({
    api,
    authenticateAs,
    page
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await page.clock.install();
    await authenticateAs(credentials);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.pageHeader).toBeVisible();
    const injectedToken = await page.evaluate(() => window.__PLAYWRIGHT_ACCESS_TOKEN__);

    // The app asks for a new token at most once a minute.
    await page.clock.fastForward('01:01');
    const renewal = waitForResponseTo(page, '/v1/auth/refresh');
    await page.keyboard.press('Shift');
    const { accessToken } = (await (await renewal).json()) as { accessToken: string };
    expect(accessToken).not.toBe(injectedToken);

    // Coming back to the tab fetches again what is on screen, which shows the token now in use.
    const nextRequest = page.waitForRequest((request) => {
      return !request.url().endsWith('/v1/auth/refresh') && request.headers().authorization !== undefined;
    });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));
    expect((await nextRequest).headers().authorization).toBe(`Bearer ${accessToken}`);
  });

  test('should warn before signing out for inactivity, then cover the page until the password is entered', async ({
    api,
    page
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await page.clock.install();
    const loginPage = new LoginPage(page);
    await loginPage.goto('/auth/login');
    const login = waitForResponseTo(page, '/v1/auth/login');
    await loginPage.fillLoginForm(credentials);
    const { accessToken } = (await (await login).json()) as { accessToken: string };
    // Read off the token rather than assumed, since the idle limit is the instance's to configure.
    const idleLimit = lifetimeOf(accessToken);
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.pageHeader).toBeVisible();

    await page.clock.fastForward(idleLimit - 90_000);
    await expect(dashboardPage.inactivityWarning).toBeVisible();

    const renewal = waitForResponseTo(page, '/v1/auth/refresh');
    await page.getByTestId('inactivity-warning-stay-signed-in').click();
    expect((await renewal).status()).toBe(200);
    await expect(dashboardPage.inactivityWarning).toBeHidden();

    await page.clock.fastForward(idleLimit);
    await expect(dashboardPage.reauthenticationDialog).toBeVisible();
    await dashboardPage.signInAgain(credentials.password);
    await expect(dashboardPage.pageHeader).toBeVisible();
  });
});
