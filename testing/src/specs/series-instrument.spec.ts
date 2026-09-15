import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

/**
 * Administers `DNP_HAPPINESS_QUESTIONNAIRE` twice with `skipProgress: true`, so both items share
 * every field name and no interstitial screen stands between them.
 */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

const ITEM_INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('series instrument', () => {
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
