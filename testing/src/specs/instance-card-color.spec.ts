import type { DarkCardTheme, LightCardTheme } from '@opendatacapture/schemas/setup';
import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const PAGES = [
  '/about',
  '/admin/audit/logs',
  '/admin/branding',
  '/admin/branding/login-page',
  '/admin/groups',
  '/admin/groups/create',
  '/admin/instrument-repos',
  '/admin/instruments',
  '/admin/mail',
  '/admin/permission-sets',
  '/admin/permission-sets/create',
  '/admin/settings',
  '/admin/users',
  '/admin/users/create',
  '/contact',
  '/datahub/instruments',
  '/datahub/subjects',
  '/instruments/accessible-instruments',
  '/user'
];

/** The color is one instance-wide document, so it is answered per page rather than written and raced. */
async function answerCardTheme(page: Page, lightCardTheme: LightCardTheme, darkCardTheme: DarkCardTheme) {
  await page.route('**/v1/setup', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    const response = await route.fetch();
    await route.fulfill({ json: { ...(await response.json()), darkCardTheme, lightCardTheme }, response });
  });
}

const instanceCard = (page: Page) => page.locator('[data-instance-card]').first();

test.describe('instance card color', () => {
  test.use({ actingRole: 'ADMIN' });

  for (const pathname of PAGES) {
    test(`should give ${pathname} a card that draws nothing by default`, async ({ getPageModel, page }) => {
      await answerCardTheme(page, 'invisible', 'invisible');
      await getPageModel('/admin/settings');
      await page.goto(pathname);
      await expect(instanceCard(page)).toHaveCSS('background-color', TRANSPARENT);
      await expect(instanceCard(page)).toHaveCSS('border-top-color', TRANSPARENT);
    });

    test(`should paint the card on ${pathname} in the instance color`, async ({ getPageModel, page }) => {
      await answerCardTheme(page, 'mist', 'mist');
      await getPageModel('/admin/settings');
      await page.goto(pathname);
      await expect(instanceCard(page)).not.toHaveCSS('background-color', TRANSPARENT);
    });
  }

  test('should leave the dashboard out of the instance color', async ({ getPageModel, page }) => {
    const tile = page.getByTestId('dashboard-chart-records-sessions');
    const tileFill = () => tile.evaluate((element) => getComputedStyle(element).backgroundColor);
    await answerCardTheme(page, 'invisible', 'invisible');
    await getPageModel('/dashboard');
    const uncolored = await tileFill();
    await page.unroute('**/v1/setup');
    await answerCardTheme(page, 'heather', 'heather');
    await page.reload();
    await expect(tile).toHaveCSS('background-color', uncolored);
    await expect(page.locator('[data-instance-card]')).toHaveCount(0);
  });

  test('should keep the page color inside a thin card on the start session page', async ({ getPageModel, page }) => {
    await answerCardTheme(page, 'mist', 'mist');
    await getPageModel('/session/start-session');
    const card = page.getByTestId('start-session-card');
    await expect(card).toHaveCSS('background-color', TRANSPARENT);
    await expect(card).toHaveCSS('border-top-width', '1px');
    await expect(card).not.toHaveCSS('border-top-color', TRANSPARENT);
  });

  test('should give the settings card a width of its own rather than that of its content', async ({
    getPageModel,
    page
  }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await getPageModel('/admin/settings');
    await expect(instanceCard(page)).toHaveCSS('width', '684px');
  });

  for (const pathname of [
    '/admin/groups/create',
    '/admin/users/create',
    '/contact',
    '/session/start-session',
    '/user'
  ]) {
    test(`should not stretch the submit button on ${pathname} across the page`, async ({ getPageModel, page }) => {
      await getPageModel('/admin/settings');
      await page.goto(pathname);
      const box = await page.getByRole('button', { exact: true, name: 'Submit' }).boundingBox();
      expect(box?.width).toBeLessThan(200);
    });
  }

  test('should not stretch the save button on the user page across the page', async ({ api, getPageModel, page }) => {
    const { user } = await api.createUser();
    await getPageModel('/admin/users/$userId', { userId: user.id });
    const box = await page.getByTestId('save-user-changes').boundingBox();
    expect(box?.width).toBeLessThan(200);
  });

  test('should leave dark mode without a color while light mode has one', async ({ getPageModel, page }) => {
    await answerCardTheme(page, 'mist', 'invisible');
    await getPageModel('/admin/settings');
    await expect(instanceCard(page)).not.toHaveCSS('background-color', TRANSPARENT);
    await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'));
    await expect(instanceCard(page)).toHaveCSS('background-color', TRANSPARENT);
    await expect(instanceCard(page)).toHaveCSS('border-top-color', TRANSPARENT);
  });

  test('should leave light mode without a color while dark mode has one', async ({ getPageModel, page }) => {
    await answerCardTheme(page, 'invisible', 'mist');
    await getPageModel('/admin/settings');
    await expect(instanceCard(page)).toHaveCSS('background-color', TRANSPARENT);
    await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'));
    await expect(instanceCard(page)).not.toHaveCSS('background-color', TRANSPARENT);
  });

  test('should paint the card a custom color', async ({ getPageModel, page }) => {
    await page.route('**/v1/setup', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.fallback();
      }
      const response = await route.fetch();
      const json = { ...(await response.json()), customCardColorLight: '#123456', lightCardTheme: 'custom' };
      await route.fulfill({ json, response });
    });
    await getPageModel('/admin/settings');
    await expect(page.locator('[data-instance-card]').first()).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await expect(page.getByLabel('Custom Color')).toHaveValue('#123456');
  });

  test('should give each palette color its own fill', async ({ getPageModel, page }) => {
    await answerCardTheme(page, 'mist', 'mist');
    const settingsPage = await getPageModel('/admin/settings');
    const sky = await instanceCard(page).evaluate((card) => getComputedStyle(card).backgroundColor);
    await page.unroute('**/v1/setup');
    await answerCardTheme(page, 'heather', 'heather');
    await settingsPage.$ref.reload();
    await expect(instanceCard(page)).not.toHaveCSS('background-color', sky);
    await expect(instanceCard(page)).not.toHaveCSS('background-color', TRANSPARENT);
  });

  // Asserted on the PATCH's own answer: the value is instance-wide and a reload would race the same
  // test running in another browser.
  test('should save the chosen color for the instance', async ({ getPageModel, page }) => {
    const settingsPage = await getPageModel('/admin/settings');
    const waitForPatch = () => {
      return page.waitForResponse((res) => res.url().endsWith('/v1/setup') && res.request().method() === 'PATCH');
    };

    const saved = waitForPatch();
    await settingsPage.cardThemeSwatch('light', 'Silver').click();
    expect(await (await saved).json()).toMatchObject({ darkCardTheme: 'invisible', lightCardTheme: 'silver' });
    await expect(settingsPage.cardThemeSwatch('light', 'Silver')).toHaveAttribute('aria-pressed', 'true');

    const restored = waitForPatch();
    await settingsPage.cardThemeSwatch('light', 'No Color').click();
    expect(await (await restored).json()).toMatchObject({ lightCardTheme: 'invisible' });
  });
});

test.describe('instance card color for a group manager', () => {
  test('should not stretch the submit button on /group/manage across the page', async ({ getPageModel, page }) => {
    await getPageModel('/group/manage');
    const box = await page.getByRole('button', { exact: true, name: 'Submit' }).boundingBox();
    expect(box?.width).toBeLessThan(200);
  });
});
