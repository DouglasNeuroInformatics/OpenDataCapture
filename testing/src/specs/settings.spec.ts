import { SettingsPage } from '../pages/_app/admin/settings.page';
import { expect, test } from '../support/fixtures';

test.describe('application settings', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should persist the default assignment duration @smoke', async ({ authenticateAs, page }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/settings');

    const settingsPage = new SettingsPage(page);
    await expect(settingsPage.pageHeader).toContainText('Application Settings');

    await settingsPage.setDefaultAssignmentDuration(45);
    await expect(page.getByText('All changes saved')).toBeVisible();

    await page.reload();
    await expect(settingsPage.defaultAssignmentDurationInput).toHaveValue('45');
  });
});
