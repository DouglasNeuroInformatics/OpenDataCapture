import { GroupManagePage } from '../pages/_app/group/manage.page';
import { expect, test } from '../support/fixtures';

test.describe('group manage', () => {
  test('should give a newly created group access to every uploaded instrument, so a manager has something to administer', async ({
    adminToken,
    apiRequestContext,
    uniqueId
  }) => {
    // Deliberately not the `api.createGroup` fixture: that helper PATCHes the accessible instruments
    // in after creating the group, so it passes whether or not creation connected anything itself.
    // An uploaded instrument has no `sourceRepoId` key at all, and the selection query has to match
    // that as well as an explicit null.
    const response = await apiRequestContext.post('/api/v1/groups', {
      data: { name: `RawGroup${uniqueId}`, type: 'CLINICAL' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(response.status()).toBe(201);

    const group = (await response.json()) as { accessibleInstrumentIds: string[] };
    expect(group.accessibleInstrumentIds.length).toBeGreaterThan(0);
  });

  test('should let a group manager preview an accessible instrument', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    // Not asserting which instrument this is: form order is whatever the API returns, not something
    // this test controls.
    await groupManagePage.$ref.getByRole('button', { name: 'Preview instrument' }).first().click();

    const dialog = groupManagePage.$ref.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Preview Form' })).toBeVisible();
  });

  test('should update accessible instruments and group settings, and keep them after navigating away and back', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    // A dedicated group + user, rather than the default `actingRole: 'GROUP_MANAGER'` fixture: that
    // role's group is created once and cached per worker (see `roleAccount` in fixtures.ts) and shared
    // by every other spec using the default role, so mutating it here would leak into their state.
    const group = await api.createGroup({ name: `Group${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });

    await authenticateAs(credentials);
    await page.goto('/group/manage');
    await expect(page).toHaveURL('/group/manage');

    const groupManagePage = new GroupManagePage(page);
    // `api.createGroup` grants access to every instrument, so uncheck one to produce an observable,
    // reversible change. Assert it starts checked first: `uncheck()` is a no-op on an already-
    // unchecked box, so without this the rest of the test would still pass if the precondition
    // silently stopped holding.
    await expect(groupManagePage.instrumentCheckbox('Happiness Questionnaire')).toBeChecked();
    await groupManagePage.instrumentCheckbox('Happiness Questionnaire').uncheck();
    await groupManagePage.subjectIdDisplayLengthInput.fill('6');
    await groupManagePage.submitButton.click();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

    // `currentGroup` is derived from the access token at boot rather than re-fetched on reload, so a
    // hard reload with the same token would show what the group looked like at login time, not the
    // update just made. Navigating away and back in the same session instead reflects the store, which
    // the mutation's own response already updated.
    await page.getByTestId('nav-button-/dashboard').click();
    await page.getByTestId('nav-button-/group/manage').click();
    await expect(page).toHaveURL('/group/manage');

    await expect(groupManagePage.instrumentCheckbox('Happiness Questionnaire')).not.toBeChecked();
    await expect(groupManagePage.subjectIdDisplayLengthInput).toHaveValue('6');
  });
});
