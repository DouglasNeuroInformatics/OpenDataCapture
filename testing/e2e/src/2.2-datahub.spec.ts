import { expect, test } from './helpers/fixtures';

test.describe('dashboard', () => {
  test('should display the dashboard header', async ({ getPageModel }) => {
    const datahubPage = await getPageModel('/datahub');
    await expect(datahubPage.pageHeader).toBeVisible();
    await expect(datahubPage.pageHeader).toContainText('Data Hub');
    await expect(datahubPage.rowActionsTrigger).toBeVisible();
  });
});
