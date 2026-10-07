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
  test("should export the records of a group manager's own group, since the export applies the caller's read rules", async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Group${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `export-${uniqueId}` }
    ]);

    await authenticateAs(credentials);
    await page.goto('/datahub/subjects');
    await expect(page.getByTestId('data-table-row')).toHaveCount(1);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('datahub-export-dropdown').getByRole('button').click();
    await page.getByRole('menuitem', { exact: true, name: 'JSON' }).click();
    const download = await downloadPromise;

    const exported = JSON.parse((await readFile(await download.path())).toString()) as { groupId: string }[];
    expect(exported.length).toBeGreaterThan(0);
    expect(exported.every((entry) => entry.groupId === group.id)).toBe(true);
  });

  test('should display the data hub header', async ({ getPageModel }) => {
    const datahubPage = await getPageModel('/datahub/subjects');
    await expect(datahubPage.pageHeader).toBeVisible();
    await expect(datahubPage.pageHeader).toContainText('Data Hub');
  });

  test('should filter the subject list by search text, so a search narrows the table to matching subjects', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Search${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.locator('[data-testid^="nav-button-/datahub/subjects/"]').click();
    await page.waitForURL('**/datahub/subjects/**/table');
    const [, subjectId] = /\/datahub\/subjects\/([^/]+)\/table/.exec(page.url()) ?? [];
    if (!subjectId) {
      throw new Error(`Failed to extract subjectId from URL: ${page.url()}`);
    }
    const displayedId = subjectId.slice(0, 9);

    const datahubPage = await getPageModel('/datahub/subjects');
    await datahubPage.searchInput.fill(displayedId);
    await expect(page.getByTestId('data-table-row').filter({ hasText: displayedId })).toBeVisible();

    await datahubPage.searchInput.fill(`NoSuchSubject${uniqueId}`);
    await expect(page.getByTestId('data-table-empty-state')).toBeVisible();
  });

  // The search bar is a form, and a native submit reloaded the page, which drops the in-memory access
  // token and lands on the login page.
  test('should keep the search results, and the user signed in, when Enter is pressed in the search bar', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const customIdentifier = `Enter${uniqueId}`;
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(customIdentifier, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    const datahubPage = await getPageModel('/datahub/subjects');
    await datahubPage.searchInput.fill(customIdentifier);
    await datahubPage.searchInput.press('Enter');

    await expect(page).toHaveURL(/\/datahub\/subjects$/);
    await expect(datahubPage.searchInput).toHaveValue(customIdentifier);
    await expect(page.getByTestId('data-table-row')).toHaveCount(1);
    await expect(page.getByTestId('data-table-row')).toContainText(customIdentifier.slice(0, 9));
  });

  test('should open a subject from the list via the row action menu, landing on its record table', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`RowAction${uniqueId}`, `Subject${uniqueId}`, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.locator('[data-testid^="nav-button-/datahub/subjects/"]').click();
    await page.waitForURL('**/datahub/subjects/**/table');
    const [, subjectId] = /\/datahub\/subjects\/([^/]+)\/table/.exec(page.url()) ?? [];
    if (!subjectId) {
      throw new Error(`Failed to extract subjectId from URL: ${page.url()}`);
    }

    const datahubPage = await getPageModel('/datahub/subjects');
    await datahubPage.searchInput.fill(subjectId.slice(0, 9));
    await datahubPage.rowActionsTrigger.click();
    await page.getByRole('menuitem', { name: 'View' }).click();

    await expect(page).toHaveURL(new RegExp(`/datahub/subjects/${subjectId}/table$`));

    // `subject-table` used to be the Table tab link, so selecting the record table by it silently
    // got the tab instead (#1475). It is the table alone now, and the tab is `subject-table-tab`.
    await expect(page.getByTestId('subject-table')).toHaveCount(1);
    await expect(page.getByTestId('subject-table').getByTestId('data-table')).toHaveCount(1);
    await expect(page.getByTestId('subject-table-tab')).toHaveAttribute(
      'data-nav-url',
      `/datahub/subjects/${subjectId}/table`
    );
  });

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

    await getPageModel('/datahub/subjects');
    await page.getByTestId('subject-lookup-search-button').click();

    const identificationForm = page.getByTestId('identification-form');
    await identificationForm.locator('[name="identificationMethod"]').selectOption('CUSTOM_ID');
    await identificationForm.locator('[name="id"]').fill(customIdentifier);
    await identificationForm.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/datahub\/subjects\/.+\/table$/);
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
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(2);

    await datahubPage.searchInput.fill(listed);
    await expect(datahubPage.rows).toHaveCount(1);

    const download = await datahubPage.exportAs('JSON');
    const payload = JSON.parse(await readFile(await download.path(), 'utf8')) as { subjectId: string }[];

    expect(payload.length).toBeGreaterThan(0);
    expect([...new Set(payload.map((row) => row.subjectId))]).toStrictEqual([listed]);
  });

  test('should list only subjects holding records once a minimum record count is applied', async ({
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
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(3);

    await datahubPage.requireAtLeastRecords(1);

    await expect(datahubPage.rows).toHaveCount(1);
    // The cell renders at most the id's first nine characters (the subjectIdDisplayLength default),
    // so the assertion matches the visible prefix rather than the full seeded id.
    await expect(datahubPage.rows).toContainText(withRecord.slice(0, 9));
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
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: twice },
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: twice },
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: once }
    ]);

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub/subjects');
    await expect(datahubPage.rows).toHaveCount(2);

    // Two records exist for one subject only, so a minimum of two must leave exactly that subject.
    await datahubPage.requireAtLeastRecords(2);
    await expect(datahubPage.rows).toHaveCount(1);
    await expect(datahubPage.rows).toContainText(twice.slice(0, 9));

    // Everything was collected just now, so the tightest window keeps it and nothing is lost.
    await datahubPage.selectCollectedWindow('pastMonth');
    await expect(datahubPage.rows).toHaveCount(1);
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
