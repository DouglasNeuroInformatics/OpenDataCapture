import { expect, test } from '../support/fixtures';

test.describe('admin settings', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should toggle the uploader feature and reflect it in the sidebar nav', async ({ getPageModel, page }) => {
    const settingsPage = await getPageModel('/admin/settings');

    // `isExperimentalFeaturesEnabled` is a single instance-wide document (seeded `false`), not a
    // uniquely-named record, so the toggle is restored at the end rather than left on.
    await settingsPage.uploaderToggle.click();
    await settingsPage.saveButton.click();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    await expect(page.getByTestId('nav-button-/upload')).toBeVisible();

    await settingsPage.uploaderToggle.click();
    await settingsPage.saveButton.click();
    await expect(page.getByTestId('nav-button-/upload')).toHaveCount(0);
  });

  test('should apply the group switcher position preference immediately', async ({ getPageModel }) => {
    const settingsPage = await getPageModel('/admin/settings');

    await settingsPage.groupSwitcherPositionSelect.click();
    await settingsPage.$ref.getByRole('option', { name: 'Top Right Corner' }).click();

    // This preference is saved to this browser's localStorage and applied immediately, with no
    // server round trip or Save button of its own.
    await expect(settingsPage.groupSwitcherPositionSelect).toContainText('Top Right Corner');
  });
});
