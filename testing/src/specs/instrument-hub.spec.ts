import { readFile } from 'node:fs/promises';

import { InstrumentHubTablePage } from '../pages/_app/datahub/instruments/$instrumentId/table.page';
import { InstrumentHubPage } from '../pages/_app/datahub/instruments/index.page';
import { HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

const HAPPINESS = 'DNP_HAPPINESS_QUESTIONNAIRE';

test.describe('instrument hub', () => {
  test('should list an instrument with the records and subjects collected for it @smoke', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    // A group of its own, so the counts are exactly what this test seeds rather than whatever else
    // the suite has written for the same instrument.
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
    // Two records for one subject and one for another: 3 records, 2 subjects. A subject count that
    // merely counted records would read 3.
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `hub-${uniqueId}-a` },
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `hub-${uniqueId}-a` },
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `hub-${uniqueId}-b` }
    ]);

    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');

    const row = hubPage.row('Happiness Questionnaire').first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('3');
    await expect(row).toContainText('2');
  });

  test('should not list series instruments, which hold no records of their own', async ({
    isolatedGroupManager,
    page
  }) => {
    await isolatedGroupManager();
    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');

    await expect(hubPage.rows.first()).toBeVisible();
    await expect(hubPage.rows).not.toContainText('SERIES');
  });

  // Sorting is the only way to find an instrument in a long catalog without searching for it, so
  // the header affordance has to actually reorder the rows rather than merely render a chevron.
  test('should reorder the list when a column header is clicked', async ({ isolatedGroupManager, page }) => {
    await isolatedGroupManager();
    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');
    await expect(hubPage.rows.first()).toBeVisible();

    await hubPage.sortBy('Instrument');
    const ascending = await hubPage.titles();
    expect(ascending.length).toBeGreaterThan(1);
    // Compared case-insensitively because that is what tanstack's `text` sorting function does;
    // asserting against `localeCompare` would flake on any mixed-case pair.
    const caseInsensitive = [...ascending].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(ascending).toStrictEqual(caseInsensitive);

    // Sort removal is disabled on these tables, so a second click is descending rather than unsorted.
    await hubPage.sortBy('Instrument');
    expect(await hubPage.titles()).toStrictEqual([...ascending].reverse());
  });

  test("should show every subject's records for one instrument, with how each was collected", async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
    // One record per collection method, so the column has to vary rather than printing a constant.
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `method-${uniqueId}-retro` }
    ]);
    const session = await api.createSession(group.id, { id: `method-${uniqueId}-inperson` }, 'IN_PERSON');
    await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);

    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');
    await hubPage.open('Happiness Questionnaire');

    const tablePage = new InstrumentHubTablePage(page);
    await expect(tablePage.rows).toHaveCount(2);
    await expect(tablePage.collectionMethodCells.filter({ hasText: 'Retrospective' })).toHaveCount(1);
    await expect(tablePage.collectionMethodCells.filter({ hasText: 'In-Person' })).toHaveCount(1);
    // Neither record came through a series, so both series cells stand empty.
    await expect(tablePage.seriesCells).toHaveCount(2);
    await expect(tablePage.seriesCells.first()).toHaveText('—');
  });

  // The download is built from the rows the table holds, so a filter has to narrow both. Getting
  // this wrong exports rows the user believed they had excluded.
  test('should export only the records left by the collection method filter, with the metadata columns', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
    const retrospective = `export-${uniqueId}-retro`;
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: retrospective }
    ]);
    const session = await api.createSession(group.id, { id: `export-${uniqueId}-inperson` }, 'IN_PERSON');
    await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);

    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');
    await hubPage.open('Happiness Questionnaire');

    const tablePage = new InstrumentHubTablePage(page);
    await expect(tablePage.rows).toHaveCount(2);

    await tablePage.excludeCollectionMethod('IN_PERSON');
    await expect(tablePage.rows).toHaveCount(1);

    const download = await tablePage.exportAs('JSON');
    const payload = JSON.parse(await readFile(await download.path(), 'utf8')) as {
      CollectionMethod: string;
      SeriesID: null | string;
      SubjectID: string;
    }[];

    expect(payload).toHaveLength(1);
    // Exports carry the stored value, not the translated label, so analysis keys on something that
    // does not change with the reader's language.
    expect(payload[0]!.CollectionMethod).toBe('RETROSPECTIVE');
    expect(payload[0]!.SeriesID).toBeNull();
    expect(payload[0]!.SubjectID).toBe(retrospective);
  });

  test('should plot the records of the instrument on its graph tab', async ({
    api,
    getPageModel,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
    await api.uploadRecords(
      group.id,
      instrumentId,
      ['a', 'b'].map((suffix) => ({
        data: HAPPINESS_RECORD,
        date: new Date(),
        subjectId: `graph-${uniqueId}-${suffix}`
      }))
    );

    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');
    await hubPage.open('Happiness Questionnaire');

    const graphPage = await getPageModel('/datahub/instruments/$instrumentId/graph', { instrumentId });
    await expect(graphPage.chart).toBeVisible();
    await expect(graphPage.scatterMarks).toHaveCount(2);

    await graphPage.selectChart('Distribution');
    await expect(graphPage.bars.first()).toBeVisible();
  });

  test('should keep the filters when switching between the table and graph tabs, so both describe one set', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName(HAPPINESS);
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `shared-${uniqueId}` }
    ]);

    const hubPage = new InstrumentHubPage(page);
    await hubPage.goto('/datahub/instruments');
    await hubPage.open('Happiness Questionnaire');

    const tablePage = new InstrumentHubTablePage(page);
    await expect(tablePage.rows).toHaveCount(1);
    await tablePage.excludeCollectionMethod('RETROSPECTIVE');
    await expect(page.getByTestId('data-table-empty-state')).toBeVisible();

    // The filter lives in the URL, so it survives the tab change rather than resetting with the
    // newly mounted tab's own state.
    await page.getByTestId('instrument-hub-graph-tab').click();
    await expect(page).toHaveURL(/methods=/);
    await expect(page.getByTestId('instrument-hub-chart')).toContainText('No records match');
  });
});
