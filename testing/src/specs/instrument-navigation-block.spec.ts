import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('leaving a started instrument', () => {
  test.beforeEach(async ({ getPageModel, page, uniqueId }) => {
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

    await new RenderInstrumentPage(page).begin();
  });

  test('should keep the clinician on the instrument, answers intact, when they decline to leave', async ({ page }) => {
    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.happinessSatisfiedRadio.click();

    await page.getByTestId('nav-button-/dashboard').click();
    await expect(instrumentPage.leaveDialog).toBeVisible();
    await instrumentPage.declineLeave();

    await expect(instrumentPage.leaveDialog).toBeHidden();
    await expect(page).toHaveURL(/\/instruments\/render\//);
    await expect(instrumentPage.happinessSatisfiedRadio).toBeChecked();
  });

  test('should leave the instrument once the clinician confirms', async ({ page }) => {
    const instrumentPage = new RenderInstrumentPage(page);

    await page.getByTestId('nav-button-/dashboard').click();
    await expect(instrumentPage.leaveDialog).toBeVisible();
    await instrumentPage.confirmLeave();

    await page.waitForURL('**/dashboard');
  });

  test('should not warn about leaving once the responses have been submitted', async ({ page }) => {
    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.completeHappinessQuestionnaire();
    await instrumentPage.submit();
    await expect(instrumentPage.summaryHeading).toBeVisible();

    await page.getByTestId('nav-button-/dashboard').click();

    await page.waitForURL('**/dashboard');
    await expect(instrumentPage.leaveDialog).toBeHidden();
  });

  // Ending a session is confirmed by its own dialog, and an instrument cannot be submitted once the
  // session is gone, so a second warning would protect nothing.
  test('should end the session without also warning about leaving the instrument', async ({ page }) => {
    const instrumentPage = new RenderInstrumentPage(page);

    await page.getByTestId('nav-button-#').click();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page).not.toHaveURL(/\/instruments\/render\//);
    await expect(instrumentPage.leaveDialog).toBeHidden();
    await expect(page.getByTestId('current-session-info')).toBeHidden();
  });
});
