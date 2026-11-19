import { SubjectGraphPage } from '../pages/_app/datahub/subjects/$subjectId/graph.page';
import { SubjectRecordDetailPage } from '../pages/_app/datahub/subjects/$subjectId/table/$recordId.page';
import { HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

const MEASURE = 'Overall Satisfaction Score';

test.describe('subject detail', () => {
  test('should plot a selected measure on the graph tab for a subject with a completed record', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const subjectId = `graph-${uniqueId}`;
    await api.uploadRecords(group.id, await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE'), [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId }
    ]);

    // Raw navigation: the route adds the chart palette to the URL, which `goto`'s exact-URL check
    // would reject.
    await page.goto(`/datahub/subjects/${subjectId}/graph`);
    const graphPage = new SubjectGraphPage(page);
    await graphPage.selectInstrument(INSTRUMENT_TITLE);
    await graphPage.selectMeasure(MEASURE);

    // `.recharts-line-curve` is the path connecting two or more points, which this single-record
    // subject never has; a dot renders per point regardless of count.
    await expect(graphPage.measureDots(MEASURE)).toBeVisible();
  });

  test('should show the subject, instrument and results sections of a record', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const session = await api.createSession(group.id, { id: `record-${uniqueId}` });
    const record = await api.createRecord(
      group.id,
      await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE'),
      session,
      HAPPINESS_RECORD
    );

    await page.goto(`/datahub/subjects/${session.subjectId}/table/${record.id}`);

    const recordDetailPage = new SubjectRecordDetailPage(page);
    await expect(recordDetailPage.subjectGroupHeading).toBeVisible();
    await expect(recordDetailPage.instrumentGroupHeading).toBeVisible();
    await expect(recordDetailPage.resultsGroupHeading).toBeVisible();
    await expect(page.getByText('Satisfaction With Personal Life')).toBeVisible();
  });
});
