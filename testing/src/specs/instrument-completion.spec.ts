import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('instrument completion', () => {
  test('should administer an instrument and surface the record for the subject @smoke', async ({
    getPageModel,
    page,
    roleAccount,
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

    // The one place the api -> web username contract is exercised end to end. Both unit tiers mock
    // the other side of it: the api spec mocks prisma, and the useInstrumentVisualization test mocks
    // useInstrumentRecords. A record carries its session's user from `GET /v1/instrument-records`,
    // and 'N/A' is what the hook falls back to when that field does not arrive.
    const { username } = await roleAccount('GROUP_MANAGER');
    await expect(page.getByTestId('subject-table-cell-username').first()).toHaveText(username);
  });

  test('should localize required-field errors from a zod v4 validation schema', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Validation${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();

    // The happiness questionnaire is authored against /runtime/v1/zod@3.x/v4, so submitting with
    // nothing filled in exercises the v4 error map that apps/web/src/services/zod.ts registers on
    // the runtime-served zod instance. Without that registration, zod's own default message
    // ("Invalid input: ...") renders instead of the localized one.
    await instrumentPage.submit();

    const errorMessages = page.getByTestId('error-message-text');
    await expect(errorMessages.first()).toBeVisible();
    for (const message of await errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
  });
});
