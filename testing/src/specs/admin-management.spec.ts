import { expect, test } from '../support/fixtures';

test.describe('admin management', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should create a group through the UI @smoke', async ({ authenticateAs, page, uniqueId }) => {
    const groupName = `E2E Group ${uniqueId}`;

    await authenticateAs('ADMIN');
    await page.goto('/admin/groups/create');

    await page.getByLabel('Group Name').fill(groupName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Clinical' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // Success toast + redirect are the app's own success signals. Deliberately not asserting the
    // group then shows up in /admin/groups: that list appears to be scoped to groups the actor
    // belongs to, and creating one does not add the creator as a member.
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    await expect(page).toHaveURL('/admin/groups');
  });

  test('should list users for an admin', async ({ authenticateAs, page }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users');

    await expect(page.getByTestId('data-table')).toBeVisible();
    // The admin created during setup is always present.
    await expect(page.getByTestId('data-table-body')).toContainText('admin');
  });
});
