import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';

import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const API = '/api/v1';

/**
 * Administers `DNP_HAPPINESS_QUESTIONNAIRE` twice with `skipProgress: true`, so both items share
 * every field name and no interstitial screen stands between them.
 */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

const ITEM_INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('series instrument', () => {
  /**
   * Assembling a series out of instruments the group has not been granted.
   *
   * An uploaded instrument stores no `sourceRepoId` key at all, so the "came from no repository"
   * branch of the server's item check is the only one that can match it — and a `null` filter alone
   * does not match an absent key. When that branch fails, every uploaded instrument reads as missing
   * and the request is refused with `Cannot find instrument '<name>' with edition '<edition>'`.
   */
  test('should assemble a series from uploaded instruments the group was never granted', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const headers = { Authorization: `Bearer ${adminToken}` };
    const group = await api.createGroup({ name: `SeriesCreate${uniqueId}` });
    // `api.createGroup` grants every instrument; take that away so the group's accessible list cannot
    // be what admits the items.
    const patched = await apiRequestContext.patch(`${API}/groups/${group.id}`, {
      data: { accessibleInstrumentIds: [] },
      headers
    });
    expect(patched.ok(), await patched.text()).toBe(true);

    const infoResponse = await apiRequestContext.get(`${API}/instruments/info`, { headers });
    const items = ((await infoResponse.json()) as InstrumentInfo[])
      .flatMap((info) => (info.kind === 'FORM' ? [{ edition: info.internal.edition, name: info.internal.name }] : []))
      .slice(0, 2);
    expect(items).toHaveLength(2);

    const response = await apiRequestContext.post(`${API}/instruments/series`, {
      data: {
        confirmDuplicate: true,
        details: { title: `Series ${uniqueId}` },
        groupId: group.id,
        items,
        language: 'en'
      },
      headers
    });

    expect(response.status(), await response.text()).toBe(201);
    expect(await response.json()).toMatchObject({ outcome: 'created' });
  });

  test('should administer each item of a skipProgress series as a fresh form', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Series${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: SERIES_INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();
    await instrumentPage.completeHappinessQuestionnaire();
    await expect(instrumentPage.happinessSatisfiedRadio).toBeChecked();
    await instrumentPage.submit();

    // The second item is a fresh administration for the same subject. Were the first item's form
    // still mounted, its answers would be presented to the subject as their own and could be
    // submitted again untouched.
    await expect(instrumentPage.happinessSatisfiedRadio).not.toBeChecked();

    await instrumentPage.completeHappinessQuestionnaire();
    await instrumentPage.submit();
    await expect(instrumentPage.seriesCompletionHeading).toBeVisible();

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { exact: true, name: ITEM_INSTRUMENT_TITLE }).click();

    // Each item is stored under its own instrument, so one pass through the series leaves two
    // records rather than one.
    await expect(page.getByTestId('data-table-body').getByTestId('data-table-row')).toHaveCount(2);
  });
});
