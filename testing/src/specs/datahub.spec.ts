import { DatahubPage } from '../pages/_app/datahub/index.page';
import { expect, test } from '../support/fixtures';

/** A minimal payload satisfying the seeded happiness questionnaire's validation schema. */
const HAPPINESS_RECORD = {
  isSatisfiedOverall: true,
  personalLifeSatisfaction: 8,
  professionalLifeSatisfaction: 7
};

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
    // A group of its own, so the row count is exactly what this test seeds. Two subjects exist only
    // through sessions while a third holds a record, so the filter must drop exactly the recordless
    // pair — hiding every subject or filtering none would both fail.
    const group = await isolatedGroupManager();
    const withRecord = `hasrecord-${uniqueId}`;
    for (const suffix of ['a', 'b']) {
      await api.createSession(group.id, { id: `recordless-${uniqueId}-${suffix}` });
    }
    await api.uploadRecords(group.id, await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE'), [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: withRecord }
    ]);

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub');
    await expect(datahubPage.rows).toHaveCount(3);

    await datahubPage.toggleWithRecordsOnly();

    await expect(datahubPage.rows).toHaveCount(1);
    // The cell renders at most the id's first nine characters (the subjectIdDisplayLength default),
    // so the assertion matches the visible prefix rather than the full seeded id.
    await expect(datahubPage.rows).toContainText(withRecord.slice(0, 9));
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
