import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { Page } from '@playwright/test';

import { AdminInstrumentsPage } from '../pages/_app/admin/instruments.page';
import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

const API = '/api/v1';

function bilingualInteractiveBundle({ name, title }: { name: string; title: string }) {
  return `(async () => {
    const runtimeImport = (specifier) => import(globalThis.__resolveImport?.(specifier) ?? specifier);
    const { z } = await runtimeImport('/runtime/v1/zod@3.x/v4.js');
    return {
      __runtimeVersion: 1,
      content: {
        defaultFullscreen: true,
        enableLanguageLock: true,
        enableLanguageSelect: true,
        enableLanguageToggle: true,
        render() {
          const switchButton = document.createElement('button');
          switchButton.textContent = 'Switch Language';
          switchButton.addEventListener('click', () => {
            window.parent.document.dispatchEvent(new CustomEvent('changeLanguage', { detail: 'en' }));
          });
          document.body.appendChild(switchButton);
        }
      },
      details: {
        description: { en: 'A bilingual interactive item', fr: 'Un élément interactif bilingue' },
        license: 'Apache-2.0',
        title: { en: ${JSON.stringify(title)}, fr: ${JSON.stringify(title)} }
      },
      internal: { edition: 1, name: ${JSON.stringify(name)} },
      kind: 'INTERACTIVE',
      language: ['en', 'fr'],
      measures: null,
      tags: { en: ['Test'], fr: ['Test'] },
      validationSchema: z.object({})
    };
  })()`;
}

/**
 * Administers `DNP_HAPPINESS_QUESTIONNAIRE` twice with `skipProgress: true`, so both items share
 * every field name and no interstitial screen stands between them.
 */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

const ITEM_INSTRUMENT_TITLE = 'Happiness Questionnaire';

/** Starts a session for a new subject and opens the repeated series on its overview screen. */
async function openSeries({
  getPageModel,
  page,
  uniqueId
}: {
  getPageModel: GetPageModel;
  page: Page;
  uniqueId: string;
}) {
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

  return new RenderInstrumentPage(page);
}

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
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    const instrumentPage = await openSeries({ getPageModel, page, uniqueId });
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

    await page.locator('[data-testid^="nav-button-/datahub/subjects/"]').click();
    await page.waitForURL('**/datahub/subjects/**/table');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { exact: true, name: ITEM_INSTRUMENT_TITLE }).click();

    // Each item is stored under its own instrument, so one pass through the series leaves two
    // records rather than one.
    await expect(page.getByTestId('data-table-body').getByTestId('data-table-row')).toHaveCount(2);
    expect(errors.filter((error) => error.includes("reading 'kind'"))).toStrictEqual([]);
  });

  // happy-dom disables iframe page loading and has no Fullscreen API, so only a browser loads the
  // `/runtime/v1` interactive host inside a series, enters fullscreen, and relays its CustomEvents.
  test('should apply language selection, language lock, toggle and fullscreen options for an interactive series item', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const itemName = `INTERACTIVE_SERIES_ITEM_${uniqueId}`;
    await api.createInstrument(bilingualInteractiveBundle({ name: itemName, title: `Interactive Item ${uniqueId}` }));
    const group = await api.createGroup({ name: `InteractiveSeries${uniqueId}` });
    const seriesTitle = `Interactive Series ${uniqueId}`;
    await api.createSeries(group.id, seriesTitle, [
      { edition: 1, name: itemName },
      { edition: 1, name: itemName }
    ]);

    await authenticateAs('ADMIN');
    const seriesPage = new AdminInstrumentsPage(page);
    await seriesPage.openSeriesView();
    await seriesPage.searchBar.fill(seriesTitle);
    await seriesPage.chooseRowAction(seriesTitle, 'Preview');

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Preview Form' }).click();
    await dialog.getByRole('button', { name: 'Begin' }).click();
    await expect(dialog.getByRole('heading', { name: 'Series Instrument in Progress' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Begin' }).click();

    await expect(dialog.getByRole('heading', { name: 'Select Language' })).toBeVisible();
    await expect(dialog.locator('iframe')).toHaveCount(0);

    await dialog.getByRole('button', { name: /Français/ }).click();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.getAttribute('name')))
      .toBe('interactive-instrument');
    await page.evaluate(() => document.exitFullscreen());

    const iframe = dialog.locator('iframe[name="interactive-instrument"]');
    await expect(iframe).toHaveAttribute('lang', 'fr');

    await dialog.locator('button[aria-haspopup="menu"]').click();
    await page.getByRole('menuitem', { name: 'Anglais' }).click();
    await expect(page.getByRole('heading', { name: 'Impossible de changer la langue' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    await dialog
      .frameLocator('iframe[name="interactive-instrument"]')
      .getByRole('button', { name: 'Switch Language' })
      .click();
    await expect(page.getByRole('heading', { name: 'Impossible de changer la langue' })).toBeVisible();
  });
});
