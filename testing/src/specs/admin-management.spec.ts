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

    // Success toast + redirect are the app's own success signals; the "group is now listed" case is
    // covered by the search test below.
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

  test('should show a validation error when the group name is missing', async ({ authenticateAs, page }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/groups/create');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByTestId('error-message-text').filter({ hasText: 'This field is required' })).toBeVisible();
    await expect(page).toHaveURL('/admin/groups/create');
  });

  test('should find a created group by search and delete it from the manage sheet', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `E2E Group ${uniqueId}` });

    await authenticateAs('ADMIN');
    await page.goto('/admin/groups');

    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(group.name);
    const row = page.getByTestId('data-table-row');
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(group.name);

    await row.getByTestId('row-actions-trigger').click();
    await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    await expect(page.getByTestId('data-table-row').filter({ hasText: group.name })).toHaveCount(0);
  });

  test('should show validation errors when submitting the user creation form empty', async ({
    authenticateAs,
    page
  }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Username, password, confirm password, first name and last name are all required.
    await expect(
      page.getByTestId('error-message-text').filter({ hasText: 'This field is required' }).first()
    ).toBeVisible();
    await expect(page).toHaveURL('/admin/users/create');
  });

  test('should reject a password that does not meet the strength requirement', async ({
    authenticateAs,
    page,
    uniqueId
  }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByLabel('Username').fill(`user${uniqueId}`);
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(
      page.getByTestId('error-message-text').filter({ hasText: 'Insufficient password strength' })
    ).toBeVisible();
    await expect(page).toHaveURL('/admin/users/create');
  });

  test('should reject a non-admin user created without a group', async ({ authenticateAs, page, uniqueId }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByLabel('Username').fill(`user${uniqueId}`);
    await page.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    // By testid rather than `getByRole('combobox').first()`: when mail is enabled a welcome-email
    // language select renders above the form, and `.first()` then opens the wrong one.
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-GROUP_MANAGER').click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(
      page.getByTestId('error-message-text').filter({ hasText: 'must belong to at least one group' })
    ).toBeVisible();
    await expect(page).toHaveURL('/admin/users/create');
  });

  test('should allow a disabled non-admin user with no group, since such an account only attributes uploaded data', async ({
    authenticateAs,
    page,
    uniqueId
  }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByLabel('Username').fill(`user${uniqueId}`);
    await page.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-GROUP_MANAGER').click();
    // The radio items carry stable ids (`<name>-true`), unlike their labels, which libui translates.
    await page.locator('#disabled-true').click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // Same dual outcome as the creation test below: a user created without an email gets the
    // copy-it-manually dialog when a parallel worker holds mail enabled.
    const fallback = page.getByTestId('welcome-email-fallback');
    await expect(fallback.or(page.getByTestId('data-table-search-bar'))).toBeVisible();
    if (await fallback.isVisible()) {
      await fallback.getByRole('button', { name: 'Done' }).click();
    }
    await expect(page).toHaveURL('/admin/users');
  });

  test('should create a user through the UI and show it in the users list @smoke', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const username = `user${uniqueId}`;

    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    // By testid, not `getByRole('combobox').first()`: when mail is enabled the page grows a
    // welcome-email language select above the form, and `.first()` then opens the wrong one.
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-GROUP_MANAGER').click();
    await page.getByRole('checkbox', { name: group.name }).check();
    await page.getByRole('button', { name: 'Submit' }).click();

    // `mail.spec.ts` may hold mail enabled in a parallel local worker; a user created without an
    // email then gets the copy-it-manually dialog before navigating. Dismiss it — the user was
    // created either way, and the users list below is the assertion that matters.
    const fallback = page.getByTestId('welcome-email-fallback');
    await expect(fallback.or(page.getByTestId('data-table-search-bar'))).toBeVisible();
    if (await fallback.isVisible()) {
      await fallback.getByRole('button', { name: 'Done' }).click();
    } else {
      await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    }
    await expect(page).toHaveURL('/admin/users');

    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(username);
    await expect(page.getByTestId('data-table-row')).toContainText(username);
  });

  test('should edit and delete a user through the manage sheet', async ({ api, authenticateAs, page, uniqueId }) => {
    // Both forms require a non-empty `groupIds` for any non-ADMIN role that is not disabled, so a
    // groupless user can never be saved from this sheet. Seed one with a group to isolate the
    // behavior under test.
    const group = await api.createGroup({ name: `E2E Group ${uniqueId}` });
    const { user } = await api.createUser({ groupIds: [group.id] });

    await authenticateAs('ADMIN');
    await page.goto('/admin/users');
    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(user.username);

    const row = page.getByTestId('data-table-row');
    await row.getByTestId('row-actions-trigger').click();
    await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();

    await page.getByLabel('Email').fill(`${user.username}@example.com`);
    // The shared `Form` component's own submit button always has `aria-label="Submit"`, even though
    // this form's visible label is "Save" -- see DouglasNeuroInformatics/libui#108.
    await page.getByRole('button', { name: 'Submit' }).click();
    // The edit and delete toasts below can stack within the notification hub's shared 5s lifetime,
    // so `.last()` targets the most recently raised one rather than an ambiguous match on both.
    await expect(page.getByRole('heading', { name: 'Success' }).last()).toBeVisible();

    await row.getByTestId('row-actions-trigger').click();
    await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByRole('heading', { name: 'Success' }).last()).toBeVisible();
    await expect(page.getByTestId('data-table-row').filter({ hasText: user.username })).toHaveCount(0);
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

    // `mail.spec.ts` may hold mail enabled in a parallel local worker, in which case a user with
    // no email gets the copy-it-manually dialog before navigating. Dismiss it — the user was
    // created either way, and the navigation is the assertion.
    const fallback = page.getByTestId('welcome-email-fallback');
    await expect(fallback.or(page.getByTestId('data-table-search-bar'))).toBeVisible();
    if (await fallback.isVisible()) {
      await fallback.getByRole('button', { name: 'Done' }).click();
    }
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
