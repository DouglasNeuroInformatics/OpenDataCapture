import { apiURL } from '../support/env';
import { expect, test } from '../support/fixtures';

test.describe('api docs', () => {
  test('should render the fields of a request body from its Zod schema', async ({ page }) => {
    await page.goto(`${apiURL}/#tag/Groups/operation/GroupsController_create`);
    const operation = page.locator('[data-section-id="tag/Groups/operation/GroupsController_create"]');
    await expect(operation.getByRole('heading', { name: 'Create Group' })).toBeVisible();
    await expect(operation.getByRole('heading', { name: /^Request Body schema/ })).toBeVisible();
    await expect(operation.getByRole('row', { name: /^name required string/ })).toBeVisible();
    await expect(
      operation.getByRole('row', { name: /^type required string Enum: "CLINICAL" "RESEARCH"/ })
    ).toBeVisible();
  });
});
