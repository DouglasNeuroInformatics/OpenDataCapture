import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'General Consent Form';

test.describe('form block', () => {
  test('should render an inline JSX block amongst the groups of a form', async ({ getPageModel, page, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Block${uniqueId}`, `Subject${uniqueId}`, 'Female');
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

    await expect(instrumentPage.consentPreamble).toBeVisible();
    await expect(instrumentPage.consentPreamble).toContainText('WHEREAS');

    await instrumentPage.acceptConsent();
    await instrumentPage.submit();
    await expect(instrumentPage.summaryHeading).toBeVisible();
  });

  test('should let a block hold state across renders through a React hook', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Stateful${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
    await page.waitForURL('**/instruments/accessible-instruments');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();

    // The block calls useState through /runtime/v1/react@19.x, which is a different module instance
    // than the React apps/web bundles. The hook reaches a live dispatcher only because the served
    // copy hands over to the host application's React rather than using the one it was built with.
    await expect(instrumentPage.consentPreambleRemainder).toBeHidden();
    await instrumentPage.consentPreambleToggle.click();
    await expect(instrumentPage.consentPreambleRemainder).toBeVisible();
    await instrumentPage.consentPreambleToggle.click();
    await expect(instrumentPage.consentPreambleRemainder).toBeHidden();
  });
});
