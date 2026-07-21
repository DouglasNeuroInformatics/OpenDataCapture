import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('instrument completion', () => {
  test('should administer an instrument and surface the record for the subject @smoke', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Instrument${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    // The active session lives in memory, so every step from here navigates via the sidebar; a
    // hard navigation would drop the session and disable these nav buttons.
    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();
    await instrumentPage.completeHappinessQuestionnaire();
    await instrumentPage.submit();

    await expect(instrumentPage.summaryHeading).toBeVisible();

    // "View Current Subject" targets the active subject's record table directly, which is far more
    // robust than matching a hashed row in the data hub list.
    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: INSTRUMENT_TITLE }).click();

    await expect(page.getByTestId('data-table-body').getByTestId('data-table-row').first()).toBeVisible();
  });
});
