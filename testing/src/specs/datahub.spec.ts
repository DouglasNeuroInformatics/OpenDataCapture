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

  // The export endpoint returns every record in the group; which of them reach the file is decided
  // client-side from the rows the table is currently listing. Nothing else covers that scoping, and
  // getting it wrong hands the user another subject's data.
  test('should export only the subjects the table is listing', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    const listed = `export-${uniqueId}-listed`;
    const filteredOut = `export-${uniqueId}-filtered-out`;
    await api.uploadRecords(
      group.id,
      instrumentId,
      [listed, filteredOut].map((subjectId) => ({ data: HAPPINESS_RECORD, date: new Date(), subjectId }))
    );

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub');
    await expect(datahubPage.rows).toHaveCount(2);

    await datahubPage.searchSubjects(listed);
    await expect(datahubPage.rows).toHaveCount(1);

    const download = await datahubPage.exportAs('JSON');
    const payload = JSON.parse(await readAll(download)) as { subjectId: string }[];

    expect(payload.length).toBeGreaterThan(0);
    expect([...new Set(payload.map((row) => row.subjectId))]).toStrictEqual([listed]);
  });
});

async function readAll(download: Awaited<ReturnType<DatahubPage['exportAs']>>): Promise<string> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}
