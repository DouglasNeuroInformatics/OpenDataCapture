import type { Page } from '@playwright/test';

import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

/** Declares `resetButton: true`; it is the longest form in the library, which is why it opts in. */
const RESETTABLE_INSTRUMENT_TITLE = 'Enhanced Demographics Questionnaire';

/** Declares no `resetButton`, so it stands in for every instrument authored before the option existed. */
const NON_RESETTABLE_INSTRUMENT_TITLE = 'Happiness Questionnaire';

/**
 * Starts a session and opens an instrument by the title on its card. The session lives in memory, so
 * every step navigates through the sidebar rather than by loading a URL.
 */
async function openInstrument(
  getPageModel: GetPageModel,
  page: Page,
  uniqueId: string,
  title: string
): Promise<RenderInstrumentPage> {
  const startSessionPage = await getPageModel('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(`Reset${uniqueId}`, `Subject${uniqueId}`, 'Female');
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();

  await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
  await page.waitForURL('**/instruments/accessible-instruments');

  const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: title }).first();
  await expect(card).toBeVisible();
  await card.click();

  const instrumentPage = new RenderInstrumentPage(page);
  await instrumentPage.begin();
  return instrumentPage;
}

test.describe('form reset button', () => {
  test('should clear every answer when an instrument opts in @smoke', async ({ getPageModel, page, uniqueId }) => {
    const instrumentPage = await openInstrument(getPageModel, page, uniqueId, RESETTABLE_INSTRUMENT_TITLE);
    await expect(instrumentPage.resetButton).toBeVisible();

    await instrumentPage.completeEnhancedDemographicsQuestionnaire();

    const householdSize = page.locator('[name="householdSize"]');
    const maritalStatus = page.locator('[name="maritalStatus"]');
    await expect(householdSize).toHaveValue('3');
    await expect(maritalStatus).toHaveValue('married');

    await instrumentPage.resetButton.click();

    // Values, not just validation errors: this is what `preventResetValuesOnReset` would suppress if
    // it were left on for an instrument that offers the button.
    await expect(householdSize).toHaveValue('');
    await expect(maritalStatus).toHaveValue('');
  });

  test('should not offer the button to an instrument that does not opt in', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const instrumentPage = await openInstrument(getPageModel, page, uniqueId, NON_RESETTABLE_INSTRUMENT_TITLE);

    await expect(instrumentPage.submitButton).toBeVisible();
    await expect(instrumentPage.resetButton).toHaveCount(0);
  });

  test('should still submit normally after a reset', async ({ getPageModel, page, uniqueId }) => {
    const instrumentPage = await openInstrument(getPageModel, page, uniqueId, RESETTABLE_INSTRUMENT_TITLE);

    await instrumentPage.completeEnhancedDemographicsQuestionnaire();
    await instrumentPage.resetButton.click();
    await instrumentPage.completeEnhancedDemographicsQuestionnaire();
    await instrumentPage.submit();

    await expect(instrumentPage.summaryHeading).toBeVisible();
  });
});
