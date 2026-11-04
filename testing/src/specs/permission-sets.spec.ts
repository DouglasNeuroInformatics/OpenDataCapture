import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import type { APIRequestContext } from '@playwright/test';

import { PermissionSetPage } from '../pages/_app/admin/permission-sets/$permissionSetId.page';
import { PermissionSetsPage } from '../pages/_app/admin/permission-sets/index.page';
import { ApiClient } from '../support/api-client';
import { SEEDED_USER_PASSWORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

const API = '/api/v1';

/**
 * One rule per scope, each observable through a list route a standard user otherwise reads almost
 * nothing of: users only in the holder's groups, groups in every group.
 */
const RULES: PermissionSetRule[] = [
  { action: 'read', scope: 'HOLDER_GROUPS', subject: 'User' },
  { action: 'read', scope: 'ALL_GROUPS', subject: 'Group' }
];

/** The users and groups a holder can read, with a token minted now, since permissions are frozen into it at login. */
async function readAccess(request: APIRequestContext, credentials: { password: string; username: string }) {
  const token = await ApiClient.login(request, credentials);
  const readIds = async (path: 'groups' | 'users') => {
    const response = await request.get(`${API}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(response.ok()).toBe(true);
    return ((await response.json()) as { id: string }[]).map(({ id }) => id);
  };
  return { groupIds: await readIds('groups'), userIds: await readIds('users') };
}

test.describe('permission sets', () => {
  test.use({ actingRole: 'ADMIN' });

  test("should create a permission set with a rule for the holder's groups and one for every group @smoke", async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const name = `Permission Set ${uniqueId}`;

    const createPage = await getPageModel('/admin/permission-sets/create');
    await createPage.fillName(name);
    await createPage.addRule({ action: 'read', subject: 'User' });
    await createPage.addRule({ action: 'read', scope: 'ALL_GROUPS', subject: 'Group' });
    await createPage.submit();

    await expect(page).toHaveURL('/admin/permission-sets');
    await new PermissionSetsPage(page).chooseRowAction(name, 'Manage');
    const setPage = new PermissionSetPage(page);
    await expect(setPage.ruleRows).toHaveCount(2);
    await expect(setPage.ruleRows.nth(0).getByTestId('permission-set-rule-scope')).toHaveText("Holder's groups");
    await expect(setPage.ruleRows.nth(1).getByTestId('permission-set-rule-scope')).toHaveText('Every group');
  });

  test('should link a permission set to a user created with one', async ({ api, authenticateAs, page, uniqueId }) => {
    const group = await api.createGroup();
    const permissionSet = await api.createPermissionSet(RULES);

    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');
    await page.getByLabel('Username').fill(`holder${uniqueId}`);
    await page.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
    await page.getByLabel('First Name').fill('Set');
    await page.getByLabel('Last Name').fill('Holder');
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-STANDARD').click();
    await page.getByRole('checkbox', { name: group.name }).check();
    await page.getByTestId('permissionSetId-select-trigger').click();
    await page.getByTestId(`permissionSetId-select-item-${permissionSet.id}`).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // Polled rather than awaited on a redirect: with mail enabled by a parallel spec, a welcome-email
    // dialog may stand between the submit and the users list.
    await expect.poll(async () => (await api.findPermissionSetById(permissionSet.id)).holderCount).toBe(1);
  });

  test("should confine a holder's-groups rule to the holder's groups, where an every-group rule reads every group", async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Holder Group ${uniqueId}` });
    const otherGroup = await api.createGroup({ name: `Other Group ${uniqueId}` });
    const { credentials, user } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    const { user: teammate } = await api.createUser({ groupIds: [group.id] });
    const { user: outsider } = await api.createUser({ groupIds: [otherGroup.id] });

    const before = await readAccess(apiRequestContext, credentials);
    expect(before.userIds).not.toContain(teammate.id);
    expect(before.groupIds).not.toContain(otherGroup.id);

    await api.setUserPermissionSet(user.id, (await api.createPermissionSet(RULES)).id);

    const after = await readAccess(apiRequestContext, credentials);
    expect(after.userIds).toContain(teammate.id);
    expect(after.userIds).not.toContain(outsider.id);
    expect(after.groupIds).toEqual(expect.arrayContaining([group.id, otherGroup.id]));
  });

  test('should switch a user between a permission set and custom permissions from the user page', async ({
    api,
    getPageModel
  }) => {
    const group = await api.createGroup();
    const { user } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    await api.setUserPermissions(user.id, [{ action: 'read', groupId: null, subject: 'Session' }]);
    const permissionSet = await api.createPermissionSet(RULES);

    const userPage = await getPageModel('/admin/users/$userId', { userId: user.id });
    await userPage.choosePermissionSource('permissionSet');
    await expect(userPage.discardCustomGrantsWarning).toBeVisible();
    await userPage.choosePermissionSet(permissionSet.id);
    await expect(userPage.chosenPermissionSetRules).toHaveCount(RULES.length);
    await userPage.saveProfile();

    await expect
      .poll(async () => api.findUserById(user.id))
      .toMatchObject({
        additionalPermissions: [],
        permissionSetId: permissionSet.id
      });

    await userPage.$ref.reload();
    await userPage.choosePermissionSource('custom');
    await userPage.addPermission({ action: 'read', subject: 'Subject' });
    await userPage.saveProfile();

    await expect
      .poll(async () => api.findUserById(user.id))
      .toMatchObject({
        additionalPermissions: [{ action: 'read', groupId: group.id, subject: 'Subject' }],
        permissionSetId: null
      });
  });

  test('should name the holder count before deleting a permission set, and leave its holders their base level', async ({
    api,
    apiRequestContext,
    getPageModel,
    page
  }) => {
    const group = await api.createGroup();
    const permissionSet = await api.createPermissionSet(RULES);
    const { credentials } = await api.createUser({
      basePermissionLevel: 'STANDARD',
      groupIds: [group.id],
      permissionSetId: permissionSet.id
    });
    const { user: teammate } = await api.createUser({ groupIds: [group.id], permissionSetId: permissionSet.id });
    expect((await readAccess(apiRequestContext, credentials)).userIds).toContain(teammate.id);

    const setPage = await getPageModel('/admin/permission-sets/$permissionSetId', {
      permissionSetId: permissionSet.id
    });
    await setPage.deleteButton.click();
    await expect(setPage.destructiveActionDialog).toContainText('2 users hold this permission set');
    await setPage.confirmDelete();

    await expect(page).toHaveURL('/admin/permission-sets');
    expect((await api.findUserById(teammate.id)).permissionSetId).toBeNull();
    expect((await readAccess(apiRequestContext, credentials)).userIds).not.toContain(teammate.id);
  });

  test('should delete a permission set from its row in the list, naming its holder count first', async ({
    api,
    getPageModel
  }) => {
    const group = await api.createGroup();
    const permissionSet = await api.createPermissionSet(RULES);
    const { user } = await api.createUser({ groupIds: [group.id], permissionSetId: permissionSet.id });

    const listPage = await getPageModel('/admin/permission-sets');
    await listPage.chooseRowAction(permissionSet.name, 'Delete');
    await expect(listPage.destructiveActionDialog).toContainText('1 user holds this permission set');
    await listPage.destructiveActionDialog.getByRole('button', { name: 'Yes' }).click();

    await expect(listPage.row(permissionSet.name)).toHaveCount(0);
    expect((await api.findUserById(user.id)).permissionSetId).toBeNull();
  });

  test('should clip a long permission set name to one line and name it in full on hover', async ({
    api,
    getPageModel,
    uniqueId
  }) => {
    const name = `Assistants de recherche cliniques des laboratoires partenaires du programme ${uniqueId}`;
    await api.createPermissionSet(RULES, { name });

    const listPage = await getPageModel('/admin/permission-sets');
    const cell = listPage.nameCell(name);

    await expect(cell).toHaveAttribute('title', name);
    const layout = await cell.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      lines: Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight))
    }));
    expect(layout.clipped).toBe(true);
    expect(layout.lines).toBe(1);
  });

  test('should offer no permission set for an administrator', async ({ api, authenticateAs, getPageModel, page }) => {
    await api.createPermissionSet(RULES);

    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-STANDARD').click();
    await expect(page.getByTestId('permissionSetId-select-trigger')).toBeVisible();
    await page.getByTestId('basePermissionLevel-select-trigger').click();
    await page.getByTestId('basePermissionLevel-select-item-ADMIN').click();
    await expect(page.getByTestId('permissionSetId-select-trigger')).toHaveCount(0);

    const { user: admin } = await api.createUser({ basePermissionLevel: 'ADMIN' });
    const userPage = await getPageModel('/admin/users/$userId', { userId: admin.id });
    await expect(userPage.adminNotice).toBeVisible();
    await expect(userPage.permissionSourceTabs).toHaveCount(0);
  });
});
