import { DatahubPage } from '../pages/_app/datahub/index.page';
import { expect, test } from '../support/fixtures';

test.describe('data hub', () => {
  test('should display the data hub header', async ({ getPageModel }) => {
    const datahubPage = await getPageModel('/datahub');
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

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    const [, subjectId] = /\/datahub\/([^/]+)\/table/.exec(page.url()) ?? [];
    if (!subjectId) {
      throw new Error(`Failed to extract subjectId from URL: ${page.url()}`);
    }
    const displayedId = subjectId.slice(0, 9);

    const datahubPage = await getPageModel('/datahub');
    await datahubPage.searchInput.fill(displayedId);
    await expect(page.getByTestId('data-table-row').filter({ hasText: displayedId })).toBeVisible();

    await datahubPage.searchInput.fill(`NoSuchSubject${uniqueId}`);
    await expect(page.getByTestId('data-table-empty-state')).toBeVisible();
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

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    const [, subjectId] = /\/datahub\/([^/]+)\/table/.exec(page.url()) ?? [];
    if (!subjectId) {
      throw new Error(`Failed to extract subjectId from URL: ${page.url()}`);
    }

    const datahubPage = await getPageModel('/datahub');
    await datahubPage.searchInput.fill(subjectId.slice(0, 9));
    await datahubPage.rowActionsTrigger.click();
    await page.getByRole('menuitem', { name: 'View' }).click();

    await expect(page).toHaveURL(new RegExp(`/datahub/${subjectId}/table$`));

    // `subject-table` used to be the Table tab link, so selecting the record table by it silently
    // got the tab instead (#1475). It is the table alone now, and the tab is `subject-table-tab`.
    await expect(page.getByTestId('subject-table')).toHaveCount(1);
    await expect(page.getByTestId('subject-table').getByTestId('data-table')).toHaveCount(1);
    await expect(page.getByTestId('subject-table-tab')).toHaveAttribute('data-nav-url', `/datahub/${subjectId}/table`);
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

    await getPageModel('/datahub');
    await page.getByTestId('subject-lookup-search-button').click();

    const identificationForm = page.getByTestId('identification-form');
    await identificationForm.locator('[name="identificationMethod"]').selectOption('CUSTOM_ID');
    await identificationForm.locator('[name="id"]').fill(customIdentifier);
    await identificationForm.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/datahub\/.+\/table$/);
  });

  test('should list only subjects holding records once "with records only" is applied', async ({
    api,
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    // A group of its own, so the row count is exactly what this test seeds. Both subjects are created
    // through a session and never given an instrument record, so the filter must empty the table.
    const group = await isolatedGroupManager();
    for (const suffix of ['a', 'b']) {
      await api.createSession(group.id, { id: `recordless-${uniqueId}-${suffix}` });
    }

    const datahubPage = new DatahubPage(page);
    await datahubPage.goto('/datahub');
    await expect(datahubPage.rows).toHaveCount(2);

    await datahubPage.toggleWithRecordsOnly();

    await expect(datahubPage.rows).toHaveCount(0);
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
