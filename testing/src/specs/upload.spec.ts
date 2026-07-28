import { UploadInstrumentPage } from '../pages/_app/upload/$instrumentId.page';
import { expect, test } from '../support/fixtures';

// The plain "Happiness Questionnaire" (kind FORM); a similarly-named consent-bundled edition also
// exists in the catalog but is kind SERIES, so it never appears in the upload instrument list.
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

/** A minimal payload satisfying the seeded happiness questionnaire's validation schema. */
const HAPPINESS_RECORD = {
  isSatisfiedOverall: true,
  personalLifeSatisfaction: 8,
  professionalLifeSatisfaction: 7
};

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
    const datahubPage = await getPageModel('/datahub');
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
    await expect(uploadInstrumentPage.errorHeading).not.toBeVisible();
    await expect(uploadInstrumentPage.submitButton).toBeVisible();
  });

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
});
