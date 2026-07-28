import { SEEDED_USER_PASSWORD } from '../support/constants';
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

  test('should create a user whose email was typed and then cleared', async ({ authenticateAs, page, uniqueId }) => {
    const username = `user_${uniqueId}`;

    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    const createUserForm = page.getByTestId('create-user-form');
    await createUserForm.getByLabel('Username').fill(username);
    await createUserForm.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
    await createUserForm.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
    await createUserForm.getByLabel('First Name').fill('Test');
    await createUserForm.getByLabel('Last Name').fill('User');

    const emailInput = createUserForm.getByLabel('Email');
    await emailInput.fill(`contact-${uniqueId}@example.org`);
    await emailInput.clear();

    // ADMIN so the form does not also demand a group.
    await createUserForm.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-ADMIN').click();
    await createUserForm.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL('/admin/users');
  });

  test('should reject a phone number with too few digits over the API', async ({ api }) => {
    await expect(api.createUser({ phoneNumber: '123' })).rejects.toThrow(/Phone number must contain at least 7 digits/);
  });

  test("should clear a user's email from the edit sheet", async ({ api, authenticateAs, page, uniqueId }) => {
    const email = `contact-${uniqueId}@example.org`;
    const group = await api.createGroup();
    const { user } = await api.createUser({ email, groupIds: [group.id] });

    await authenticateAs('ADMIN');
    await page.goto('/admin/users');
    // Search so the seeded user is the only row, whichever page it would otherwise land on.
    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(user.username);

    const editSheet = page.getByTestId('admin-user-edit-sheet');
    const emailInput = editSheet.getByLabel('Email');

    await page.getByTestId('data-table-row').dblclick();
    await expect(emailInput).toHaveValue(email);
    await emailInput.clear();
    await editSheet.getByRole('button', { name: 'Submit' }).click();
    await expect(editSheet).toBeHidden();

    await page.getByTestId('data-table-row').dblclick();
    await expect(emailInput).toHaveValue('');
  });
});
