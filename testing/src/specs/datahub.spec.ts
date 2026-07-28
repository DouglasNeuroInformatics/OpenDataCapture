import { DatahubPage } from '../pages/_app/datahub/index.page';
import { expect, test } from '../support/fixtures';

test.describe('data hub', () => {
  test('should display the data hub header', async ({ getPageModel }) => {
    const datahubPage = await getPageModel('/datahub');
    await expect(datahubPage.pageHeader).toBeVisible();
    await expect(datahubPage.pageHeader).toContainText('Data Hub');
  });

  test('should list only subjects holding records once "with records only" is applied', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    // A group of its own, so the row count is exactly what this test seeds. Both subjects are created
    // through a session and never given an instrument record, so the filter must empty the table.
    const group = await isolatedGroupManager();
    for (const suffix of ['a', 'b']) {
      await api.createSession(group.id, { id: `recordless-${uniqueId}-${suffix}` });
    }

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub');
    await expect(datahubPage.rows).toHaveCount(2);

    await datahubPage.toggleWithRecordsOnly();

    await expect(datahubPage.rows).toHaveCount(0);
  });

  // `GET /v1/subjects` is gated on `read Subject`, which a standard user holds, but resolving
  // `hasRecord` reads instrument records, which they do not. The honest answer is an empty list.
  test('should answer the with-records filter for a caller who may read no records', async ({
    apiRequestContext,
    roleAccount
  }) => {
    const { accessToken } = await roleAccount('STANDARD');

    const response = await apiRequestContext.get('/api/v1/subjects?hasRecord=true', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toStrictEqual([]);
  });
});
