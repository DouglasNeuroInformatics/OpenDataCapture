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

  // Remote assignments are on unless an admin opts out, and the rest of the suite drives them, so
  // this is the one test that touches the flag and it turns it back on before finishing.
  test('should toggle remote assignments and reflect it in the sidebar nav', async ({ getPageModel, page }) => {
    const settingsPage = await getPageModel('/admin/settings');
    const remoteAssignmentNav = page.getByTestId('nav-button-/session/remote-assignment');

    await expect(settingsPage.remoteAssignmentsToggle).toHaveAttribute('aria-checked', 'true');
    await expect(remoteAssignmentNav).toBeVisible();

    const disabled = waitForSetupPatch(page);
    await settingsPage.remoteAssignmentsToggle.click();
    expect((await disabled).ok()).toBe(true);
    await expect(remoteAssignmentNav).toHaveCount(0);

    const restored = waitForSetupPatch(page);
    await settingsPage.remoteAssignmentsToggle.click();
    expect((await restored).ok()).toBe(true);
    await expect(remoteAssignmentNav).toBeVisible();
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
