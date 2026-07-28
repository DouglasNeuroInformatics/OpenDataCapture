import { GroupManagePage } from '../pages/_app/group/manage.page';
import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

test.describe('group manage', () => {
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
    apiRequestContext,
    authenticateWithToken,
    page,
    uniqueId
  }) => {
    // A dedicated group + user, rather than the default `actingRole: 'GROUP_MANAGER'` fixture: that
    // role's group is created once and cached per worker (see `roleAccount` in fixtures.ts) and shared
    // by every other spec using the default role, so mutating it here would leak into their state.
    const group = await api.createGroup({ name: `Group${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });

    await authenticateWithToken(await ApiClient.login(apiRequestContext, credentials));
    await page.goto('/group/manage');
    await expect(page).toHaveURL('/group/manage');

    const groupManagePage = new GroupManagePage(page);
    // A freshly created group has every non-repo instrument accessible already, so uncheck one to
    // produce an observable, reversible change.
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
