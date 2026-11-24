import { readFile } from 'node:fs/promises';

import { replacer } from '@douglasneuroinformatics/libjs';
import { $Json } from '@opendatacapture/schemas/core';

import { SubjectGraphPage } from '../pages/_app/datahub/subjects/$subjectId/graph.page';
import { SubjectRecordDetailPage } from '../pages/_app/datahub/subjects/$subjectId/table/$recordId.page';
import { HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

const MEASURE = 'Overall Satisfaction Score';

function dateAndNullableFormBundle({ name, title }: { name: string; title: string }) {
  return `(async () => {
    const runtimeImport = (specifier) => import(globalThis.__resolveImport?.(specifier) ?? specifier);
    const { z } = await runtimeImport('/runtime/v1/zod@3.x/index.js');
    return {
      __runtimeVersion: 1,
      content: {
        dob: { kind: 'date', label: 'Date of Birth' },
        notes: { kind: 'string', label: 'Notes', variant: 'input' }
      },
      details: { description: 'A form with a date field and a nullable field', license: 'Apache-2.0', title: ${JSON.stringify(title)} },
      internal: { edition: 1, name: ${JSON.stringify(name)} },
      kind: 'FORM',
      language: 'en',
      measures: null,
      tags: [],
      validationSchema: z.object({ dob: z.date(), notes: z.string().nullable() })
    };
  })()`;
}

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

  test('should include fields absent from the first record in the subject table and wide CSV export', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const subjectId = `table-union-${uniqueId}`;
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date('2026-01-10T12:00:00Z'), subjectId },
      {
        data: { ...HAPPINESS_RECORD, isSatisfiedOverall: false, reasonNotSatisfied: 'Not enough sleep' },
        date: new Date('2026-01-11T12:00:00Z'),
        subjectId
      }
    ]);

    await page.goto(`/datahub/subjects/${subjectId}/table`);
    await page.getByTestId('select-instrument-dropdown-trigger').click();
    await page.getByRole('option', { name: INSTRUMENT_TITLE }).click();

    const cells = page.getByTestId('subject-table-cell-reasonNotSatisfied');
    await expect(cells).toHaveCount(2);
    await expect(cells.filter({ hasText: 'Not enough sleep' })).toHaveCount(1);
    await expect(cells.filter({ hasText: 'undefined' })).toHaveCount(0);

    const downloadStarted = page.waitForEvent('download', (d) => d.suggestedFilename().endsWith('.csv'));
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { exact: true, name: 'CSV' }).click();
    const download = await downloadStarted;
    const csv = await readFile(await download.path(), 'utf8');
    expect(csv.split(/\r?\n/)[0]).toContain('reasonNotSatisfied');
    expect(csv).toContain('Not enough sleep');
  });

  test('should export date fields unquoted and null fields as empty cells in wide CSV downloads', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const customTitle = `Date Export ${uniqueId}`;
    const instrumentId = await api.createInstrument(
      dateAndNullableFormBundle({ name: `DATE_EXPORT_${uniqueId}`, title: customTitle })
    );
    const group = await isolatedGroupManager();
    const subjectId = `date-export-${uniqueId}`;
    await api.uploadRecords(group.id, instrumentId, [
      {
        data: $Json.parse(
          JSON.parse(JSON.stringify({ dob: new Date('2000-01-02T00:00:00.000Z'), notes: null }, replacer))
        ),
        date: new Date('2026-01-15T12:00:00Z'),
        subjectId
      }
    ]);

    await page.goto(`/datahub/subjects/${subjectId}/table`);
    await page.getByTestId('select-instrument-dropdown-trigger').click();
    await page.getByRole('option', { name: customTitle }).click();

    const downloadStarted = page.waitForEvent('download', (d) => d.suggestedFilename().endsWith('.csv'));
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { exact: true, name: 'CSV' }).click();
    const download = await downloadStarted;
    const csv = await readFile(await download.path(), 'utf8');
    const [, dataRow] = csv.split(/\r?\n/);
    expect(dataRow).toMatch(/,2000-01-02,$/);
    expect(csv).not.toContain('"2000-01-02');
    expect(dataRow).not.toContain('null');
  });
});
