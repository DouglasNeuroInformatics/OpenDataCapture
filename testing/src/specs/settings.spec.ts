import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';

import { expect, test } from '../support/fixtures';

test.describe('application settings', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should persist the default assignment duration @smoke', async ({ getPageModel, page, uniqueId }) => {
    // The setting is instance-wide and every project shares one database, so a fixed value would already
    // be stored by the time the second browser runs, and the settings page would skip the save entirely.
    const durationDays = 1 + (Number.parseInt(uniqueId, 16) % MAX_ASSIGNMENT_DURATION_DAYS);

    const settingsPage = await getPageModel('/admin/settings');
    await expect(settingsPage.pageHeader).toContainText('Application Settings');

    const saveResponse = page.waitForResponse(
      (response) => response.url().endsWith('/v1/setup') && response.request().method() === 'PATCH'
    );
    await settingsPage.setDefaultAssignmentDuration(durationDays);
    expect((await saveResponse).ok()).toBe(true);

    await page.reload();
    await expect(settingsPage.defaultAssignmentDurationInput).toHaveValue(String(durationDays));
  });
});
