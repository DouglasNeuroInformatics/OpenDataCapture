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

  test.describe('active languages', () => {
    // `activeLanguages` is one instance-wide document seeded with English and French, so these tests
    // restore it at the end and must not run concurrently with each other.
    test.describe.configure({ mode: 'serial' });

    test('should hide the language toggle once only one language is offered', async ({ getPageModel, page }) => {
      const settingsPage = await getPageModel('/admin/settings');

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

    test('should move the sidebar to an offered language when the language being read is deactivated', async ({
      getPageModel,
      page
    }) => {
      const settingsPage = await getPageModel('/admin/settings');

      // The sidebar is the casualty when this goes wrong: it renders the toggle, so it is the ancestor
      // a correction made from the toggle cannot reach. `Iniciar una sesión` is a namespace string,
      // translated on any branch. Spanish is restored to inactive at the end, as it is seeded.
      const sidebar = page.getByTestId('sidebar');
      const activated = waitForSetupPatch(page);
      await settingsPage.activeLanguageCheckbox('es').click();
      expect((await activated).ok()).toBe(true);

      await sidebar.getByTestId('language-toggle').getByRole('button').click();
      await page.getByRole('menuitem', { name: 'Español' }).click();
      await expect(sidebar).toContainText('Iniciar una sesión');

      const deactivatedSpanish = waitForSetupPatch(page);
      await settingsPage.activeLanguageCheckbox('es').click();
      expect((await deactivatedSpanish).ok()).toBe(true);

      await expect(sidebar).toContainText('Start Session');
      await expect(sidebar).not.toContainText('Iniciar una sesión');
    });
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
