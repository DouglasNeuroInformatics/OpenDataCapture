import { readFile } from 'node:fs/promises';

import { DatahubPage } from '../pages/_app/datahub/subjects/index.page';
import { HAPPINESS_RECORD, PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('data hub on a phone', () => {
  test.use({ viewport: PHONE_VIEWPORT });

  test('should keep every table control within the width of the search bar, so none is pushed off screen', async ({
    getPageModel
  }) => {
    const datahubPage = await getPageModel('/datahub/subjects');
    await expect(datahubPage.exportDropdown).toBeVisible();

    const searchBarBox = (await datahubPage.searchBar.boundingBox())!;
    for (const control of [datahubPage.subjectLookupButton, datahubPage.filtersTrigger, datahubPage.exportDropdown]) {
      const controlBox = (await control.boundingBox())!;
      expect(controlBox.x + controlBox.width).toBeLessThanOrEqual(searchBarBox.x + searchBarBox.width);
    }
  });
});

test.describe('data hub', () => {
  test('should navigate to a subject by custom identifier via the subject lookup dialog', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const customIdentifier = `Lookup${uniqueId}`;
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(customIdentifier, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    const datahubPage = await getPageModel('/datahub/subjects');
    await expect(datahubPage.pageHeader).toContainText('Data Hub');
    await page.getByTestId('subject-lookup-search-button').click();

    const identificationForm = page.getByTestId('identification-form');
    await identificationForm.locator('[name="subjectIdentificationMethod"]').selectOption('CUSTOM_ID');
    await identificationForm.locator('[name="id"]').fill(customIdentifier);
    await identificationForm.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/datahub\/subjects\/.+\/table$/);
  });

  // The export endpoint returns every record the caller may read in the group; which of them reach
  // the file is decided client-side from the rows the table is currently listing. Nothing else covers
  // that scoping, and getting it wrong hands the user another subject's data.
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
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(2);

    await datahubPage.searchInput.fill(listed);
    await expect(datahubPage.rows).toHaveCount(1);

    const download = await datahubPage.exportAs('JSON');
    const payload = JSON.parse(await readFile(await download.path(), 'utf8')) as {
      groupId: string;
      subjectId: string;
    }[];

    expect(payload.length).toBeGreaterThan(0);
    expect([...new Set(payload.map((row) => row.subjectId))]).toStrictEqual([listed]);
    expect([...new Set(payload.map((row) => row.groupId))]).toStrictEqual([group.id]);
  });

  // The counts and the date window are read from the per-subject summary, so a filter that narrows
  // on them is the only thing proving that summary actually reached the table.
  test('should narrow the list by a minimum record count and by a collection-date window', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    const twice = `twice-${uniqueId}`;
    const once = `once-${uniqueId}`;
    // A subject that exists only through a session has no summary entry at all, so it is what
    // catches a filter that lets a missing count through.
    await Promise.all([
      api.createSession(group.id, { id: `recordless-${uniqueId}` }),
      api.uploadRecords(group.id, instrumentId, [
        { data: HAPPINESS_RECORD, date: new Date(), subjectId: twice },
        { data: HAPPINESS_RECORD, date: new Date(), subjectId: twice },
        { data: HAPPINESS_RECORD, date: new Date(), subjectId: once }
      ])
    ]);

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(3);

    // Two records exist for one subject only, so a minimum of two must leave exactly that subject.
    await datahubPage.requireAtLeastRecords(2);
    await expect(datahubPage.rows).toHaveCount(1);
    await expect(datahubPage.rows).toContainText(twice.slice(0, 9));

    // Everything was collected just now, so the tightest window keeps it and nothing is lost.
    await datahubPage.selectCollectedWindow('pastMonth');
    await expect(datahubPage.rows).toHaveCount(1);
  });
});

test.describe('data hub export', () => {
  // The export used to date each row by the day the record was inserted, which loses both the
  // collection date of anything entered later and the time of day of everything.
  test('should export the collection date and time of each record and its session', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    const group = await isolatedGroupManager();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    const collectedAt = '2024-01-15T10:30:00.000Z';
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(collectedAt), subjectId: `dated-${uniqueId}` }
    ]);

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(1);

    const download = await datahubPage.exportAs('JSON');
    const payload = JSON.parse(await readFile(await download.path(), 'utf8')) as {
      sessionDate: string;
      timestamp: string;
    }[];

    expect(payload.length).toBeGreaterThan(0);
    for (const row of payload) {
      expect(row).toMatchObject({ sessionDate: collectedAt, timestamp: collectedAt });
    }
  });
});
