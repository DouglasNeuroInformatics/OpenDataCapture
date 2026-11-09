import { readFile } from 'node:fs/promises';

import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';

import { UploadInstrumentPage } from '../pages/_app/upload/$instrumentId.page';
import { UploadPage } from '../pages/_app/upload/index.page';
import { HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

// The plain "Happiness Questionnaire" (kind FORM); a similarly-named consent-bundled edition also
// exists in the catalog but is kind SERIES, so it never appears in the upload instrument list.
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('upload', () => {
  test('should upload a valid CSV and create a record for the subject it names @smoke', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const subjectId = `Upload${uniqueId}`;
    const csv = [
      'subjectID,date,personalLifeSatisfaction,professionalLifeSatisfaction,isSatisfiedOverall,reasonNotSatisfied,causesOfDissatisfaction',
      `${subjectId},2024-01-15,8,7,true,,`
    ].join('\n');

    const uploadPage = await getPageModel('/upload');
    await uploadPage.selectInstrument(INSTRUMENT_TITLE);
    await page.waitForURL('**/upload/**');

    const uploadInstrumentPage = new UploadInstrumentPage(page);
    await expect(uploadInstrumentPage.pageHeader).toContainText(INSTRUMENT_TITLE);
    await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'happiness.csv' });
    await uploadInstrumentPage.submitButton.click();

    await expect(page.getByText('Success')).toBeVisible();

    // The subject list truncates the displayed id to 9 characters by default, so match on the prefix.
    const datahubPage = await getPageModel('/datahub/subjects');
    await datahubPage.searchInput.fill(subjectId);
    await expect(page.getByTestId('data-table-row').filter({ hasText: subjectId.slice(0, 9) })).toBeVisible();
  });

  test('should show a validation error and let the user try again after uploading a CSV with an invalid value', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const csv = [
      'subjectID,date,personalLifeSatisfaction,professionalLifeSatisfaction,isSatisfiedOverall,reasonNotSatisfied,causesOfDissatisfaction',
      `BadUpload${uniqueId},2024-01-15,not-a-number,7,true,,`
    ].join('\n');

    const uploadPage = await getPageModel('/upload');
    await uploadPage.selectInstrument(INSTRUMENT_TITLE);
    await page.waitForURL('**/upload/**');

    const uploadInstrumentPage = new UploadInstrumentPage(page);
    await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'bad.csv' });
    await uploadInstrumentPage.submitButton.click();

    await expect(uploadInstrumentPage.errorHeading).toBeVisible();
    await expect(page.getByText("Invalid number type: 'not-a-number'")).toBeVisible();

    await uploadInstrumentPage.tryAgainButton.click();
    await expect(uploadInstrumentPage.errorHeading).toBeHidden();
    await expect(uploadInstrumentPage.submitButton).toBeVisible();
  });

  // A cell missing its closing parenthesis was once accepted with its last character cut off, so
  // `quantity:12` was stored as 1. No seeded instrument has a record-array field, so the test stores
  // its own before creating the group that will use it.
  test('should reject a record array cell missing its closing parenthesis, naming its column', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const title = `Record Array Upload ${uniqueId}`;
    await api.createInstrument(
      formBundle({
        content: `{
          items: {
            fieldset: {
              name: { kind: 'string', label: 'Name', variant: 'input' },
              quantity: { kind: 'number', label: 'Quantity', variant: 'input' }
            },
            kind: 'record-array',
            label: 'Items'
          }
        }`,
        name: `RECORD_ARRAY_UPLOAD_${uniqueId}`,
        title,
        validationSchema: 'z.object({ items: z.array(z.object({ name: z.string(), quantity: z.number() })) })'
      })
    );
    await isolatedGroupManager();
    const csv = [
      'subjectID,date,items',
      `RecordArray${uniqueId},2024-01-15,"RECORD_ARRAY(name:item1,quantity:12"`
    ].join('\n');

    const uploadPage = new UploadPage(page);
    await uploadPage.goto('/upload');
    await uploadPage.selectInstrument(title);
    await page.waitForURL('**/upload/**');

    const uploadInstrumentPage = new UploadInstrumentPage(page);
    await expect(uploadInstrumentPage.pageHeader).toContainText(title);
    await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'items.csv' });
    await uploadInstrumentPage.submitButton.click();

    await expect(uploadInstrumentPage.errorHeading).toBeVisible();
    await expect(
      page.getByText(
        "Syntax error in RECORD_ARRAY declaration: RECORD_ARRAY(name:item1,quantity:12 at column name: 'items' and row number '1'"
      )
    ).toBeVisible();
  });

  // The template once failed with "Unexpected Error" for any field it could not describe, which named
  // neither the field nor its type.
  test('should name the column and Zod type of a field the template cannot describe', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const title = `Unsupported Field Upload ${uniqueId}`;
    await api.createInstrument(
      formBundle({
        content: `{ pair: { kind: 'string', label: 'Pair', variant: 'input' } }`,
        name: `UNSUPPORTED_FIELD_UPLOAD_${uniqueId}`,
        title,
        validationSchema: 'z.object({ pair: z.tuple([z.string()]) })'
      })
    );
    await isolatedGroupManager();

    const uploadPage = new UploadPage(page);
    await uploadPage.goto('/upload');
    await uploadPage.selectInstrument(title);
    await page.waitForURL('**/upload/**');

    const uploadInstrumentPage = new UploadInstrumentPage(page);
    await expect(uploadInstrumentPage.pageHeader).toContainText(title);
    await uploadInstrumentPage.templateButton.click();

    await expect(uploadInstrumentPage.templateErrorHeading).toBeVisible();
    await expect(page.getByText("Unsupported Zod type 'ZodTuple' at column name: 'pair'")).toBeVisible();
  });

  // A count recorded as a union of literals, or a native enum, once failed both the template and the
  // import. Instruments reach the page built against either zod major, and each has its own path.
  for (const zodEntry of ['index.js', 'v4.js'] as const) {
    test.describe(`fixed-choice fields of a form written against zod@3.x/${zodEntry}`, () => {
      let title: string;

      test.beforeEach(async ({ api, uniqueId }) => {
        title = `Fixed Choice Upload ${uniqueId}`;
        await api.createInstrument(
          formBundle({
            content: `{
              putbacks: { kind: 'number', label: 'Putbacks', variant: 'input' },
              severity: { kind: 'number', label: 'Severity', variant: 'input' }
            }`,
            name: `FIXED_CHOICE_UPLOAD_${uniqueId}`,
            title,
            validationSchema: `z.object({
              putbacks: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
              severity: z.nativeEnum({ 0: 'Mild', 1: 'Severe', Mild: 0, Severe: 1 })
            })`,
            zodEntry
          })
        );
      });

      test('should list the allowed values of each field in the template', async ({ isolatedGroupManager, page }) => {
        await isolatedGroupManager();
        const uploadPage = new UploadPage(page);
        await uploadPage.goto('/upload');
        await uploadPage.selectInstrument(title);
        await page.waitForURL('**/upload/**');

        const uploadInstrumentPage = new UploadInstrumentPage(page);
        const downloadPromise = page.waitForEvent('download');
        await uploadInstrumentPage.templateButton.click();
        const download = await downloadPromise;

        const template = (await readFile(await download.path())).toString();
        expect(template).toBe('subjectID,date,putbacks,severity\r\nstring,yyyy-mm-dd,0/1/2/3,0/1');
      });

      test('should store an uploaded value as the number its schema declares', async ({
        adminToken,
        apiRequestContext,
        isolatedGroupManager,
        page,
        uniqueId
      }) => {
        const group = await isolatedGroupManager();
        const csv = ['subjectID,date,putbacks,severity', `FixedChoice${uniqueId},2024-01-15,2,1`].join('\n');

        const uploadPage = new UploadPage(page);
        await uploadPage.goto('/upload');
        await uploadPage.selectInstrument(title);
        await page.waitForURL('**/upload/**');

        const uploadInstrumentPage = new UploadInstrumentPage(page);
        await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'choices.csv' });
        await uploadInstrumentPage.submitButton.click();
        await expect(page.getByText('Success')).toBeVisible();

        const records = await apiRequestContext.get(`/api/v1/instrument-records?groupId=${group.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(await records.json()).toMatchObject([{ data: { putbacks: 2, severity: 1 } }]);
      });

      test('should reject a value outside the allowed ones, naming its column and row', async ({
        isolatedGroupManager,
        page,
        uniqueId
      }) => {
        await isolatedGroupManager();
        const csv = ['subjectID,date,putbacks,severity', `FixedChoice${uniqueId},2024-01-15,7,1`].join('\n');

        const uploadPage = new UploadPage(page);
        await uploadPage.goto('/upload');
        await uploadPage.selectInstrument(title);
        await page.waitForURL('**/upload/**');

        const uploadInstrumentPage = new UploadInstrumentPage(page);
        await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'choices.csv' });
        await uploadInstrumentPage.submitButton.click();

        await expect(uploadInstrumentPage.errorHeading).toBeVisible();
        await expect(
          page.getByText("Invalid value '7': expected one of 0/1/2/3 at column name: 'putbacks' and row number '1'")
        ).toBeVisible();
      });
    });
  }

  // The response was previously every record in the group for the instrument, so a second upload
  // leaked the first one's records back to the caller. An earlier upload to the same group and
  // instrument is what distinguishes the scoped response from the group-wide one.
  test('should answer a batch upload with exactly the records it created', async ({ api, uniqueId }) => {
    const group = await api.createGroup();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `upload-${uniqueId}-earlier` }
    ]);

    const batch = ['a', 'b', 'c'].map((suffix) => `upload-${uniqueId}-${suffix}`);
    const records = await api.uploadRecords(
      group.id,
      instrumentId,
      batch.map((subjectId) => ({ data: HAPPINESS_RECORD, date: new Date(), subjectId }))
    );

    expect(records).toHaveLength(3);
    expect(new Set(records.map((record) => record.subjectId))).toStrictEqual(new Set(batch));
  });

  // The bulk payload has nowhere to carry a file, so a record for a file instrument could only ever
  // be incomplete. The upload is refused before anything is written.
  test('should refuse a batch upload for a file instrument without writing a session or record', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const headers = { Authorization: `Bearer ${adminToken}` };
    const subjectId = `file-${uniqueId}`;
    const data: UploadInstrumentRecordsData = {
      groupId: group.id,
      instrumentId: await api.findInstrumentIdByName('ARBITRARY_SINGLE_FILE'),
      records: [{ data: {}, date: new Date(), subjectId }]
    };

    const response = await apiRequestContext.post('/api/v1/instrument-records/upload', { data, headers });

    expect(response.status()).toBe(422);
    // Sessions are created only after the subjects they name, so a missing subject means no session.
    const subject = await apiRequestContext.get(`/api/v1/subjects/${subjectId}`, { headers });
    expect(subject.status()).toBe(404);
    const records = await apiRequestContext.get(`/api/v1/instrument-records?groupId=${group.id}`, { headers });
    expect(await records.json()).toStrictEqual([]);
  });
});

test.describe('upload instrument selection while loading', () => {
  // The page once copied its search results into state from an effect keyed on a fresh `data ?? []`,
  // so it re-rendered in a loop for as long as the instrument list was still in flight.
  test('should not re-render in a loop while the instrument list is loading', async ({ getPageModel, page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    await page.route('**/v1/instruments/info*', async (route) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      await route.continue();
    });

    await getPageModel('/upload');

    await expect(page.getByRole('cell', { exact: true, name: INSTRUMENT_TITLE })).toBeVisible();
    expect(errors.filter((error) => error.includes('Maximum update depth exceeded'))).toStrictEqual([]);
  });
});

/**
 * A form written as the bundle the api stores: an expression that evaluates to the instrument. Its
 * runtime import resolves through the `__resolveImport` the api's sandbox provides, and against the
 * web origin in the browser, as a bundled import would. `content` and `validationSchema` are source
 * text, the schema written against the `z` of `zodEntry`: `index.js` is the zod 3 API and `v4.js`
 * the zod 4 one.
 */
function formBundle({
  content,
  name,
  title,
  validationSchema,
  zodEntry = 'index.js'
}: {
  content: string;
  name: string;
  title: string;
  validationSchema: string;
  zodEntry?: 'index.js' | 'v4.js';
}) {
  return `(async () => {
    const runtimeImport = (specifier) => import(globalThis.__resolveImport?.(specifier) ?? specifier);
    const { z } = await runtimeImport('/runtime/v1/zod@3.x/${zodEntry}');
    return {
      __runtimeVersion: 1,
      content: ${content},
      details: {
        description: 'A form seeded by the upload spec',
        license: 'Apache-2.0',
        title: ${JSON.stringify(title)}
      },
      internal: { edition: 1, name: ${JSON.stringify(name)} },
      kind: 'FORM',
      language: 'en',
      measures: null,
      tags: [],
      validationSchema: ${validationSchema}
    };
  })()`;
}
