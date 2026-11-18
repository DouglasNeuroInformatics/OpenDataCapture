import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';

/**
 * Opens the first row on the list's second page, runs `whileAway` on the row's page and follows its
 * Return link. Resolves to the list's first row and the text it had on the second page.
 */
async function returnFromSecondPage(
  page: Page,
  { returnTestId, whileAway }: { returnTestId: string; whileAway?: () => Promise<void> }
) {
  const firstRow = page.getByTestId('data-table-row').first();
  const secondPageButton = page.getByTestId('data-table').getByRole('button', { exact: true, name: '2' });
  // The button exists only once more than one page of rows has loaded.
  await expect(secondPageButton).toBeVisible();
  const firstRowOnFirstPage = await firstRow.textContent();
  await secondPageButton.click();
  await expect(firstRow).not.toHaveText(firstRowOnFirstPage!);
  const firstRowOnSecondPage = (await firstRow.textContent())!;

  await firstRow.dblclick();
  await expect(page.getByTestId(returnTestId)).toBeVisible();
  await whileAway?.();
  await page.getByTestId(returnTestId).click();
  return { firstRow, firstRowOnSecondPage };
}

test.describe('returning to a list', () => {
  test('should come back to the page of users it left, even after the list changed meanwhile', async ({
    api,
    authenticateAs,
    page
  }) => {
    await Promise.all(Array.from({ length: 11 }, () => api.createUser()));
    await authenticateAs('ADMIN');
    await page.goto('/admin/users');
    const { firstRow, firstRowOnSecondPage } = await returnFromSecondPage(page, {
      returnTestId: 'admin-user-back',
      whileAway: async () => {
        await api.createUser();
      }
    });
    await expect(firstRow).toHaveText(firstRowOnSecondPage);
  });

  test('should come back to the page of permission sets it left', async ({ api, authenticateAs, page, uniqueId }) => {
    // The list is ordered by name, so a leading '!' keeps these eleven ahead of the sets other specs
    // create meanwhile, and the second page starts on the eleventh of them whatever else is added.
    await Promise.all(
      Array.from({ length: 11 }, (_, index) => {
        const name = `!List Return ${uniqueId} ${String(index).padStart(2, '0')}`;
        return api.createPermissionSet([{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'User' }], { name });
      })
    );
    await authenticateAs('ADMIN');
    await page.goto('/admin/permission-sets');
    const { firstRow, firstRowOnSecondPage } = await returnFromSecondPage(page, {
      returnTestId: 'admin-permission-set-back'
    });
    await expect(firstRow).toHaveText(firstRowOnSecondPage);
  });

  test('should come back to the page of subjects it left', async ({ api, isolatedGroupManager, page }) => {
    const group = await isolatedGroupManager();
    for (let index = 0; index < 12; index++) {
      await api.createSubject(group.id);
    }
    await page.goto('/datahub/subjects');
    const { firstRow, firstRowOnSecondPage } = await returnFromSecondPage(page, { returnTestId: 'subject-hub-back' });
    await expect(firstRow).toHaveText(firstRowOnSecondPage);
  });
});
