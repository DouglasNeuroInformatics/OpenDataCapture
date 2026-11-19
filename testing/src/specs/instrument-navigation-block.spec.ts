import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('leaving a started instrument', () => {
  test('should keep the clinician on the instrument, answers intact, until they confirm leaving', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Leave${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    // The active session lives in memory, so navigate via the sidebar rather than a hard load.
    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();
    await instrumentPage.happinessSatisfiedRadio.click();

    await page.getByTestId('nav-button-/dashboard').click();
    await expect(instrumentPage.leaveDialog).toBeVisible();
    await instrumentPage.declineLeave();

    await expect(instrumentPage.leaveDialog).toBeHidden();
    await expect(page).toHaveURL(/\/instruments\/render\//);
    await expect(instrumentPage.happinessSatisfiedRadio).toBeChecked();

    await page.getByTestId('nav-button-/dashboard').click();
    await expect(instrumentPage.leaveDialog).toBeVisible();
    await instrumentPage.confirmLeave();

    await page.waitForURL('**/dashboard');
  });
});
