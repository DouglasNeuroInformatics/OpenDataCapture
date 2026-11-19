import { readFile } from 'node:fs/promises';

import { UploadInstrumentPage } from '../pages/_app/upload/$instrumentId.page';
import { UploadPage } from '../pages/_app/upload/index.page';
import { expect, test } from '../support/fixtures';

// The plain "Happiness Questionnaire" (kind FORM); a similarly-named consent-bundled edition also
// exists in the catalog but is kind SERIES, so it never appears in the upload instrument list.
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

const HAPPINESS_HEADER =
  'subjectID,date,personalLifeSatisfaction,professionalLifeSatisfaction,isSatisfiedOverall,reasonNotSatisfied,causesOfDissatisfaction';

test.describe('upload', () => {
  test('should report an invalid CSV, then accept a corrected one and create a record for the subject it names', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const subjectId = `Upload${uniqueId}`;
    const uploadPage = await getPageModel('/upload');
    await uploadPage.selectInstrument(INSTRUMENT_TITLE);
    await page.waitForURL('**/upload/**');

    const uploadInstrumentPage = new UploadInstrumentPage(page);
    await expect(uploadInstrumentPage.pageHeader).toContainText(INSTRUMENT_TITLE);
    await uploadInstrumentPage.uploadFile({
      buffer: Buffer.from([HAPPINESS_HEADER, `${subjectId},2024-01-15,not-a-number,7,true,,`].join('\n')),
      mimeType: 'text/csv',
      name: 'bad.csv'
    });
    await uploadInstrumentPage.submitButton.click();
    await expect(uploadInstrumentPage.errorHeading).toBeVisible();
    await expect(page.getByText("Invalid number type: 'not-a-number'")).toBeVisible();

    await uploadInstrumentPage.tryAgainButton.click();
    await expect(uploadInstrumentPage.errorHeading).toBeHidden();
    await uploadInstrumentPage.uploadFile({
      buffer: Buffer.from([HAPPINESS_HEADER, `${subjectId},2024-01-15,8,7,true,,`].join('\n')),
      mimeType: 'text/csv',
      name: 'happiness.csv'
    });
    await uploadInstrumentPage.submitButton.click();
    await expect(page.getByText('Success')).toBeVisible();

    // The subject list truncates the displayed id to 9 characters by default, so match on the prefix.
    const datahubPage = await getPageModel('/datahub/subjects');
    await datahubPage.searchInput.fill(subjectId);
    await expect(page.getByTestId('data-table-row').filter({ hasText: subjectId.slice(0, 9) })).toBeVisible();
  });

  // Instruments reach the page built against either zod major, each through its own path, so one
  // instrument per major carries every field kind that once failed the template or the import: a
  // union of literals, a native enum, and a record keyed by an enum (the instrument guide's
  // number-record field). The unit tests run the same zod, but only here does a bundle evaluated
  // from the runtime reach them.
  for (const zodEntry of ['index.js', 'v4.js'] as const) {
    test(`should describe and import the fixed-choice and record fields of a form written against zod@3.x/${zodEntry}`, async ({
      adminToken,
      api,
      apiRequestContext,
      isolatedGroupManager,
      page,
      uniqueId
    }) => {
      const title = `Fixed Choice Upload ${uniqueId}`;
      await api.createInstrument(
        formBundle({
          content: `{
            putbacks: { kind: 'number', label: 'Putbacks', variant: 'input' },
            ratings: {
              items: { friday: { label: 'Friday' }, monday: { label: 'Monday' } },
              kind: 'number-record',
              label: 'Ratings',
              options: { 1: 'Poor', 2: 'Fair', 3: 'Good' },
              variant: 'likert'
            },
            severity: { kind: 'number', label: 'Severity', variant: 'input' }
          }`,
          name: `FIXED_CHOICE_UPLOAD_${uniqueId}`,
          title,
          validationSchema: `z.object({
            putbacks: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
            severity: z.nativeEnum({ 0: 'Mild', 1: 'Severe', Mild: 0, Severe: 1 }),
            ratings: z.record(z.enum(['monday', 'friday']), z.union([z.literal(1), z.literal(2), z.literal(3)]))
          })`,
          zodEntry
        })
      );
      const group = await isolatedGroupManager();

      const uploadPage = new UploadPage(page);
      await uploadPage.goto('/upload');
      await uploadPage.selectInstrument(title);
      await page.waitForURL('**/upload/**');

      const uploadInstrumentPage = new UploadInstrumentPage(page);
      const downloadPromise = page.waitForEvent('download');
      await uploadInstrumentPage.templateButton.click();
      const template = (await readFile(await (await downloadPromise).path())).toString();
      expect(template).toBe(
        'subjectID,date,putbacks,severity,ratings\r\nstring,yyyy-mm-dd,0/1/2/3,0/1,"RECORD(monday: 1/2/3, friday: 1/2/3)"'
      );

      const csv = [
        'subjectID,date,putbacks,severity,ratings',
        `FixedChoice${uniqueId},2024-01-15,2,1,"RECORD(monday: 3, friday: 1)"`
      ].join('\n');
      await uploadInstrumentPage.uploadFile({ buffer: Buffer.from(csv), mimeType: 'text/csv', name: 'choices.csv' });
      await uploadInstrumentPage.submitButton.click();
      await expect(page.getByText('Success')).toBeVisible();

      const records = await apiRequestContext.get(`/api/v1/instrument-records?groupId=${group.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(await records.json()).toMatchObject([
        { data: { putbacks: 2, ratings: { friday: 1, monday: 3 }, severity: 1 } }
      ]);
    });
  }
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
