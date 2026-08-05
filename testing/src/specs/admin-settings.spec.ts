import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';
import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';

/** Every setting on this page autosaves, so the PATCH is the only signal that a change landed. */
function waitForSetupPatch(page: Page) {
  return page.waitForResponse(
    (response) => response.url().endsWith('/v1/setup') && response.request().method() === 'PATCH'
  );
}

test.describe('admin settings', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should toggle the uploader feature and reflect it in the sidebar nav', async ({ getPageModel, page }) => {
    const settingsPage = await getPageModel('/admin/settings');

    // `isExperimentalFeaturesEnabled` is a single instance-wide document (seeded `false`), not a
    // uniquely-named record, so the toggle is restored at the end rather than left on.
    const enabled = waitForSetupPatch(page);
    await settingsPage.uploaderToggle.click();
    expect((await enabled).ok()).toBe(true);
    await expect(page.getByTestId('nav-button-/upload')).toBeVisible();

    const disabled = waitForSetupPatch(page);
    await settingsPage.uploaderToggle.click();
    expect((await disabled).ok()).toBe(true);
    await expect(page.getByTestId('nav-button-/upload')).toHaveCount(0);
  });

  test('should persist the default assignment duration @smoke', async ({ getPageModel, page, uniqueId }) => {
    // The setting is instance-wide and every project shares one database, so a fixed value would already
    // be stored by the time the second browser runs, and the settings page would skip the save entirely.
    const durationDays = 1 + (Number.parseInt(uniqueId, 16) % MAX_ASSIGNMENT_DURATION_DAYS);

    const settingsPage = await getPageModel('/admin/settings');
    await expect(settingsPage.pageHeader).toContainText('Application Settings');

    const saved = waitForSetupPatch(page);
    await settingsPage.setDefaultAssignmentDuration(durationDays);
    expect((await saved).ok()).toBe(true);

    await page.reload();
    await expect(settingsPage.defaultAssignmentDurationInput).toHaveValue(String(durationDays));
  });

  // Every step that changes `activeLanguages` lives in this one test. The setting is a single
  // instance-wide document and `fullyParallel` is on, so a second test mutating it would race this
  // one — a worker that added Spanish here would break the "only one language left" assertion there.
  test('should hide the language toggle once only one language is offered', async ({ getPageModel, page }) => {
    const settingsPage = await getPageModel('/admin/settings');

    // `activeLanguages` is one instance-wide document seeded with English and French, so the
    // deactivated language is restored at the end rather than left off for the next spec.
    await expect(settingsPage.activeLanguageCheckbox('en')).toBeVisible();
    await expect(page.getByTestId('sidebar').getByTestId('language-toggle')).toBeVisible();

    const deactivated = waitForSetupPatch(page);
    await settingsPage.activeLanguageCheckbox('fr').click();
    expect((await deactivated).ok()).toBe(true);

    await expect(page.getByTestId('sidebar').getByTestId('language-toggle')).toHaveCount(0);
    // The last remaining language cannot be turned off, so an instance always offers one.
    await expect(settingsPage.activeLanguageCheckbox('en')).toBeDisabled();

    const restored = waitForSetupPatch(page);
    await settingsPage.activeLanguageCheckbox('fr').click();
    expect((await restored).ok()).toBe(true);
    await expect(page.getByTestId('sidebar').getByTestId('language-toggle')).toBeVisible();

    // Spanish is off by default, so reaching it at all takes activating it first. The admin nav
    // group and its submenu are inline `t()` strings rather than namespace keys, which is exactly
    // where a missing Spanish entry hides: the page renders, in English.
    const activated = waitForSetupPatch(page);
    await settingsPage.activeLanguageCheckbox('es').click();
    expect((await activated).ok()).toBe(true);

    await settingsPage.selectLanguage('Español');
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar.getByRole('button', { name: 'Panel de administración' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Configuración de la aplicación' })).toBeVisible();

    await settingsPage.selectLanguage('English');
    const removed = waitForSetupPatch(page);
    await settingsPage.activeLanguageCheckbox('es').click();
    expect((await removed).ok()).toBe(true);
  });

  test('should apply the group switcher position preference immediately', async ({ getPageModel }) => {
    const settingsPage = await getPageModel('/admin/settings');

    await settingsPage.groupSwitcherPositionSelect.click();
    await settingsPage.$ref.getByRole('option', { name: 'Top Right Corner' }).click();

    // This preference is saved to this browser's localStorage and applied immediately, with no
    // server round trip.
    await expect(settingsPage.groupSwitcherPositionSelect).toContainText('Top Right Corner');
  });
});
