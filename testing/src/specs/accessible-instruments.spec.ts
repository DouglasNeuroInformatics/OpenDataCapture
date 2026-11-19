import type { Page } from '@playwright/test';

import { AccessibleInstrumentsPage } from '../pages/_app/instruments/accessible-instruments.page';
import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { StartSessionPage } from '../pages/_app/session/start-session.page';
import { PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

/** Starts a session, then reaches Administer Instrument through the sidebar, which keeps the in-memory session. */
async function openAdministerWithSession(page: Page, uniqueId: string) {
  const startSessionPage = new StartSessionPage(page);
  await startSessionPage.goto('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(`Administer${uniqueId}`, `Subject${uniqueId}`, 'Female');
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();
  await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
  await page.waitForURL('**/instruments/accessible-instruments');
  return new AccessibleInstrumentsPage(page);
}

test.describe('accessible instruments on a phone', () => {
  test.use({ viewport: PHONE_VIEWPORT });

  test('should give the search bar a full-width row above the filters, so the dropdowns cannot crowd it out', async ({
    getPageModel
  }) => {
    const accessibleInstrumentsPage = await getPageModel('/instruments/accessible-instruments');
    await expect(accessibleInstrumentsPage.searchBar).toBeVisible();

    const showcaseBox = (await accessibleInstrumentsPage.instrumentShowcase.boundingBox())!;
    const searchBarBox = (await accessibleInstrumentsPage.searchBar.boundingBox())!;
    const kindFilterBox = (await accessibleInstrumentsPage.kindFilter.boundingBox())!;

    expect(searchBarBox.width).toBeCloseTo(showcaseBox.width, 0);
    expect(kindFilterBox.y).toBeGreaterThanOrEqual(searchBarBox.y + searchBarBox.height);
  });
});

test.describe('administering an instrument', () => {
  test('should run the instrument in the language chosen while the rest of the app keeps its own', async ({
    authenticateAs,
    page,
    uniqueId
  }) => {
    await authenticateAs('GROUP_MANAGER');
    const accessibleInstrumentsPage = await openAdministerWithSession(page, uniqueId);
    await accessibleInstrumentsPage.chooseCardLanguage('Happiness Questionnaire', 'French');
    await accessibleInstrumentsPage.instrumentCard('Happiness Questionnaire').click();

    const instrumentPage = new RenderInstrumentPage(page);
    await instrumentPage.begin();
    await expect(page.getByText('Dans quelle mesure êtes-vous satisfait de votre vie personnelle ?')).toBeVisible();
    await expect(page.getByTestId('nav-button-/instruments/accessible-instruments')).toContainText('Administer');
  });
});
