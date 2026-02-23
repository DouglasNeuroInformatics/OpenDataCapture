import { expect, test } from './helpers/fixtures';

test.describe('dashhub', () => {
  test('should display the dashhub header', async ({ getPageModel }) => {
    const datahubPage = await getPageModel('/datahub');
    await expect(datahubPage.pageHeader).toBeVisible();
    await expect(datahubPage.pageHeader).toContainText('Data Hub');
    //await expect(datahubPage.rowActionsTrigger).toBeVisible();
  });
});
