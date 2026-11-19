import type { Page } from '@playwright/test';

import { SEEDED_USER_PASSWORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

/**
 * `mail.spec.ts` may hold mail enabled in a parallel local worker. A user created without an email
 * then gets the copy-it-manually dialog before the redirect to the users list, which this dismisses.
 * Without the dialog the app redirects straight away, and `requireSuccessToast` asserts its toast.
 */
async function dismissWelcomeEmailFallback(page: Page, { requireSuccessToast = false } = {}) {
  const fallback = page.getByTestId('welcome-email-fallback');
  await expect(fallback.or(page.getByTestId('data-table-search-bar'))).toBeVisible();
  if (await fallback.isVisible()) {
    await fallback.getByRole('button', { name: 'Done' }).click();
  } else if (requireSuccessToast) {
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  }
}

test.describe('admin management', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should create a group through the UI, then find it by search and open its manage sheet', async ({
    authenticateAs,
    page,
    uniqueId
  }) => {
    const groupName = `E2E Group ${uniqueId}`;

    await authenticateAs('ADMIN');
    await page.goto('/admin/groups/create');

    await page.getByLabel('Group Name').fill(groupName);
    await page.getByTestId('type-select-trigger').click();
    await page.getByTestId('type-select-item-CLINICAL').click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    await expect(page).toHaveURL('/admin/groups');

    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(groupName);
    const row = page.getByTestId('data-table-row');
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(groupName);
    await expect(row.getByTestId('group-cell-type')).toBeVisible();
    await expect(row.getByTestId('group-status-active')).toBeVisible();

    await row.getByTestId('row-actions-trigger').click();
    await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
    await expect(page.getByRole('dialog').getByText(groupName)).toBeVisible();
  });

  test('should list users with their login status left of their archive status, and every group on hover', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const secondGroup = await api.createGroup({ name: `B Group ${uniqueId}` });
    const firstGroup = await api.createGroup({ name: `A Group ${uniqueId}` });
    const { user: enabled } = await api.createUser({ groupIds: [secondGroup.id, firstGroup.id] });
    const { user: disabled } = await api.createUser({ disabled: true, groupIds: [firstGroup.id] });
    await authenticateAs('ADMIN');
    await page.goto('/admin/users');

    // The admin created during setup is always present.
    await expect(page.getByTestId('data-table-body')).toContainText('admin');
    const headers = (await page.getByTestId('data-table-head').getByRole('button').allTextContents()).filter(Boolean);
    expect(headers.indexOf('Enabled / Disabled')).toBe(headers.indexOf('Status') - 1);

    const search = page.getByTestId('data-table-search-bar').getByRole('searchbox');
    await search.fill(enabled.username);
    await expect(page.getByTestId('user-login-status')).toHaveText('Enabled');
    await expect(page.getByTestId('user-status-active')).toBeVisible();
    const groupsCell = page.getByTestId('user-groups');
    await expect(groupsCell).toHaveText(`${firstGroup.name} +1`);
    await groupsCell.hover();
    await expect(page.getByTestId('user-groups-list').first()).toHaveText([firstGroup.name, secondGroup.name].join(''));

    await search.fill(disabled.username);
    await expect(page.getByTestId('user-login-status')).toHaveText('Disabled');
    await expect(page.getByTestId('user-status-active')).toBeVisible();
  });

  test('should create a user through the UI with the username lowercased and show it in the users list', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const username = `user${uniqueId}`;

    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    await page.getByLabel('Username').fill(username.toUpperCase());
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

    // The user was created either way, and the users list below is the assertion that matters.
    await dismissWelcomeEmailFallback(page, { requireSuccessToast: true });
    await expect(page).toHaveURL('/admin/users');

    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(username);
    await expect(page.getByTestId('data-table-row')).toContainText(username);
  });

  test('should edit and archive a user from the user page', async ({ api, authenticateAs, page, uniqueId }) => {
    // Both forms require a non-empty `groupIds` for any non-ADMIN role that is not disabled, so a
    // groupless user can never be saved from the page. Seed one with a group to isolate the
    // behavior under test.
    const group = await api.createGroup({ name: `E2E Group ${uniqueId}` });
    const { user } = await api.createUser({ groupIds: [group.id] });

    await authenticateAs('ADMIN');
    await page.goto('/admin/users');
    await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(user.username);

    const row = page.getByTestId('data-table-row');
    await row.getByTestId('row-actions-trigger').click();
    await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
    await expect(page).toHaveURL(`/admin/users/${user.id}`);

    const profileForm = page.getByTestId('update-user-form');
    await profileForm.getByLabel('Email').fill(`${user.username}@example.com`);
    await page.getByTestId('save-user-changes').click();
    // The edit and archive toasts below can stack within the notification hub's shared 5s lifetime,
    // so `.last()` targets the most recently raised one rather than an ambiguous match on both.
    await expect(page.getByRole('heading', { name: 'Success' }).last()).toBeVisible();

    await page.getByRole('button', { exact: true, name: 'Archive' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByRole('button', { exact: true, name: 'Unarchive' })).toBeVisible();
    expect((await api.findUserById(user.id)).archivedAt).toBeTruthy();
  });

  test('should save account changes and completed permission rows together without using plus to confirm them', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { user } = await api.createUser({ email: `contact-${uniqueId}@example.org`, groupIds: [group.id] });
    const userPage = await getPageModel('/admin/users/$userId', { userId: user.id });

    // Enabled then Disabled on one line under Status, with Enabled chosen for an enabled user.
    const enabled = userPage.profileForm.getByLabel('Enabled', { exact: true });
    const disabled = userPage.profileForm.getByLabel('Disabled', { exact: true });
    await expect(enabled).toBeChecked();
    await expect(disabled).not.toBeChecked();
    const enabledBox = (await enabled.boundingBox())!;
    const disabledBox = (await disabled.boundingBox())!;
    expect(Math.abs(enabledBox.y - disabledBox.y)).toBeLessThan(2);
    expect(disabledBox.x).toBeGreaterThan(enabledBox.x);
    expect(enabledBox.y).toBeGreaterThan(
      (await userPage.profileForm.getByText('Status', { exact: true }).boundingBox())!.y
    );

    // One save button, below the permissions, submits both cards.
    await expect(userPage.profileForm.getByRole('button', { name: 'Submit' })).toBeHidden();
    const save = page.getByTestId('save-user-changes');
    expect((await save.boundingBox())!.y).toBeGreaterThan(
      (await page.getByTestId('user-permissions-card').boundingBox())!.y
    );

    // Clearing the email is the account change, since a blank field must be saved as no email at all.
    await userPage.profileForm.getByLabel('Email').clear();
    await userPage.addPermission({ action: 'read', subject: 'User' });
    await userPage.addPermissionRowAfterCurrent();
    await userPage.addPermission({ action: 'create', subject: 'Instrument' });
    const beforeSave = await api.findUserById(user.id);
    expect(beforeSave.email).not.toBeNull();
    expect(beforeSave.additionalPermissions).toEqual([]);

    await userPage.saveProfile();
    await expect(userPage.permissionRows).toHaveCount(2);
    await expect(page.getByRole('heading', { exact: true, name: 'Success' })).toHaveCount(1);
    await page.reload();
    await expect(userPage.profileForm.getByLabel('Email')).toHaveValue('');
    const saved = await api.findUserById(user.id);
    expect(saved.email).toBeNull();
    expect(saved.additionalPermissions).toEqual([
      { action: 'read', groupId: group.id, subject: 'User' },
      { action: 'create', groupId: null, subject: 'Instrument' }
    ]);
  });

  test('should save nothing while a permission row is half filled or the account is invalid, rather than silently dropping either', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const [group, otherGroup] = await Promise.all([api.createGroup(), api.createGroup()]);
    const { user } = await api.createUser({ groupIds: [group.id, otherGroup.id] });
    const userPage = await getPageModel('/admin/users/$userId', { userId: user.id });
    const email = userPage.profileForm.getByLabel('Email');
    await email.fill(`half-filled-${uniqueId}@example.org`);
    // With two groups no scope is preselected, so this row cannot become a grant yet.
    await userPage.addPermission({ action: 'read', subject: 'Subject' });

    await page.getByTestId('save-user-changes').click();

    await expect(page.getByTestId('permission-drafts-incomplete')).toBeVisible();
    await expect(userPage.addPermissionRow).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('heading', { exact: true, name: 'Success' })).toHaveCount(0);
    const stored = await api.findUserById(user.id);
    expect(stored.email).not.toBe(`half-filled-${uniqueId}@example.org`);
    expect(stored.additionalPermissions).toEqual([]);

    await userPage.selectPermissionOption('scope', otherGroup.id);
    await email.fill('invalid-email');
    await userPage.saveProfile();
    await expect(userPage.submitError).toBeVisible();
    expect((await api.findUserById(user.id)).additionalPermissions).toEqual([]);

    await email.fill(`half-filled-${uniqueId}@example.org`);
    await userPage.saveProfile();
    await expect(page.getByTestId('permission-drafts-incomplete')).toBeHidden();
    await expect(userPage.permissionRows).toHaveCount(1);
    expect((await api.findUserById(user.id)).additionalPermissions).toEqual([
      { action: 'read', groupId: otherGroup.id, subject: 'Subject' }
    ]);
  });

  test('should replace a grant with one confined to the only group the user belongs to from the user page', async ({
    api,
    getPageModel,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Scoped Group ${uniqueId}` });
    const { user } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    await api.setUserPermissions(user.id, [{ action: 'create', groupId: null, subject: 'Instrument' }]);

    const userPage = await getPageModel('/admin/users/$userId', { userId: user.id });
    await expect(userPage.permissionRows).toHaveCount(1);
    await expect(userPage.permissionRows.first()).toContainText('Create');
    await expect(userPage.permissionRows.first()).toContainText('Instrument');
    await expect(userPage.permissionRows.first().getByTestId('user-permission-scope')).toContainText('All Groups');

    await userPage.removePermission(0);
    // The scope is left untouched: with a single group it is preselected, so the group is the
    // default rather than something the admin has to remember to choose.
    await userPage.addPermission({ action: 'read', subject: 'User' });
    expect((await api.findUserById(user.id)).additionalPermissions).toHaveLength(1);
    await userPage.saveProfile();

    await expect(userPage.permissionRows.first().getByTestId('user-permission-scope')).toContainText(group.name);
    await expect(userPage.permissionRows).toHaveCount(1);
    expect((await api.findUserById(user.id)).additionalPermissions).toStrictEqual([
      { action: 'read', groupId: group.id, subject: 'User' }
    ]);
  });
});
