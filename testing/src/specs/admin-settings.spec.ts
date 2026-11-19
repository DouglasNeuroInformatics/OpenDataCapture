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

  // Both settings are one instance-wide document rather than a uniquely-named record, so the uploader
  // is switched back off at the end. The duration is random so that it never matches the one already
  // stored, which the settings page would not save.
  test('should save instance settings, applying them at once and keeping them across a reload', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const durationDays = 1 + (Number.parseInt(uniqueId, 16) % MAX_ASSIGNMENT_DURATION_DAYS);
    const uploaderLink = page.getByTestId('nav-button-/upload');

    const settingsPage = await getPageModel('/admin/settings');
    await expect(settingsPage.pageHeader).toContainText('Application Settings');

    const enabled = waitForSetupPatch(page);
    await settingsPage.uploaderToggle.click();
    expect((await enabled).ok()).toBe(true);
    await expect(uploaderLink).toBeVisible();

    const saved = waitForSetupPatch(page);
    await settingsPage.setDefaultAssignmentDuration(durationDays);
    expect((await saved).ok()).toBe(true);

    await page.reload();
    await expect(settingsPage.defaultAssignmentDurationInput).toHaveValue(String(durationDays));
    await expect(uploaderLink).toBeVisible();

    const disabled = waitForSetupPatch(page);
    await settingsPage.uploaderToggle.click();
    expect((await disabled).ok()).toBe(true);
    await expect(uploaderLink).toHaveCount(0);
  });
});
