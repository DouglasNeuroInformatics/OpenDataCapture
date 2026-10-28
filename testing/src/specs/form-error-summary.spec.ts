import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('form error summary', () => {
  test('should tell the user under the submit button that fields need resolving', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Summary${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');
    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();
    await expect(instrumentPage.errorSummary).toHaveCount(0);

    await instrumentPage.submit();
    await expect(instrumentPage.errorMessages.first()).toBeVisible();
    await expect(instrumentPage.errorSummary).toBeVisible();

    await instrumentPage.completeHappinessQuestionnaire();
    await instrumentPage.submit();
    await expect(instrumentPage.summaryHeading).toBeVisible();
    await expect(instrumentPage.errorSummary).toHaveCount(0);
  });
});
