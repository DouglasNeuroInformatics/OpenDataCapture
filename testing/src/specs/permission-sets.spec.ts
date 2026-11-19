import { PermissionSetPage } from '../pages/_app/admin/permission-sets/$permissionSetId.page';
import { PermissionSetsPage } from '../pages/_app/admin/permission-sets/index.page';
import { expect, test } from '../support/fixtures';

test.describe('permission sets', () => {
  test.use({ actingRole: 'ADMIN' });

  test("should create a permission set with a rule for the holder's groups and one for every group, clipping its long name in the list", async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const name = `Assistants de recherche cliniques des laboratoires partenaires du programme ${uniqueId}`;

    const createPage = await getPageModel('/admin/permission-sets/create');
    await createPage.fillName(name);
    await createPage.addRule({ action: 'read', subject: 'User' });
    await createPage.addRule({ action: 'read', scope: 'ALL_GROUPS', subject: 'Group' });
    await createPage.submit();

    await expect(page).toHaveURL('/admin/permission-sets');
    const listPage = new PermissionSetsPage(page);
    await listPage.search(name);
    const cell = listPage.nameCell(name);
    await expect(cell).toHaveAttribute('title', name);
    const layout = await cell.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      lines: Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight))
    }));
    expect(layout.clipped).toBe(true);
    expect(layout.lines).toBe(1);

    await listPage.chooseRowAction(name, 'Manage');
    const setPage = new PermissionSetPage(page);
    await expect(setPage.ruleRows).toHaveCount(2);
    await expect(setPage.ruleRows.nth(0).getByTestId('permission-set-rule-scope')).toHaveText("Holder's groups");
    await expect(setPage.ruleRows.nth(1).getByTestId('permission-set-rule-scope')).toHaveText('Every group');
  });
});
