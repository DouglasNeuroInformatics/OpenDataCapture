import type { Locator } from '@playwright/test';

import { expect, test } from '../support/fixtures';

// Importing a repository clones real instruments from GitHub server-side (see
// `InstrumentReposService.create` in `apps/api`), and `SetupService` explicitly skips seeding the
// default repository when `NODE_ENV=test` "which must not reach out to GitHub". So this suite cannot
// safely exercise a successful import, sync, or delete.

test.describe('admin instrument repos', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should show the instrument repositories page', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');

    await expect(reposPage.pageHeader).toContainText('Instrument Repositories');
    await expect(reposPage.dataTable).toBeVisible();
    await expect(reposPage.addRepositoryButton).toBeVisible();
  });
});

test.describe('admin instrument repos layout', () => {
  test.use({ actingRole: 'ADMIN' });

  // Answered by the test rather than the API, which must not reach out to GitHub under NODE_ENV=test.
  const repo = {
    createdAt: '2026-10-01T00:00:00.000Z',
    groupIds: [],
    id: '6a0000000000000000000001',
    instrumentIds: ['a', 'b'],
    lastSyncedAt: '2026-10-28T00:00:00.000Z',
    name: 'ODC_MontembeaultLab_Instruments',
    owner: 'DouglasNeuroInformatics',
    repoName: 'ODC_MontembeaultLab_Instruments',
    updatedAt: '2026-10-28T00:00:00.000Z',
    url: 'https://github.com/DouglasNeuroInformatics/ODC_MontembeaultLab_Instruments'
  };
  const partialSync = {
    action: 'SYNC',
    createdAt: '2026-10-28T00:00:00.000Z',
    createdCount: 1,
    failures: [
      {
        instrumentDir: 'CPP_SERIES',
        message:
          "Instrument validation failed - content.0.items.1: Series item 'PHQ_9' edition 2 does not exist on this instance, so the series cannot be resolved",
        stage: 'LOAD'
      }
    ],
    id: '6a0000000000000000000002',
    importedCount: 2,
    message: null,
    repoId: repo.id,
    repoName: 'LaboratoireDeRecherchePsychiatrique/instruments-cliniques-internes-du-laboratoire',
    updatedAt: '2026-10-28T00:00:00.000Z'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/instrument-repos', (route) => {
      return route.request().method() === 'GET' ? route.fulfill({ json: [repo] }) : route.continue();
    });
    // Regexes, not globs: the history is requested with query parameters, and its two routes must not
    // match each other.
    await page.route(/\/v1\/instrument-repos\/sync\/logs\/latest/, (route) => route.fulfill({ json: [partialSync] }));
    await page.route(/\/v1\/instrument-repos\/sync\/logs(\?|$)/, (route) => {
      return route.fulfill({ json: { data: [partialSync], pageCount: 1, total: 1 } });
    });
  });

  // Layout is the one thing the unit tests cannot see (happy-dom has no layout engine), so this walks
  // both tabs once and measures everything that has to fit at the admin pages' real width.
  test('should fit both tables to the page, clipping long values to one line rather than spilling or scrolling', async ({
    getPageModel
  }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const expectInvisibleCard = async () => {
      await expect(reposPage.card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(reposPage.card).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      // Tailwind v4 compiles `shadow-none` to transparent layers rather than the keyword `none`,
      // so the assertion is that every layer is invisible, not that there are no layers.
      const shadow = await reposPage.card.evaluate((card) => getComputedStyle(card).boxShadow);
      expect(shadow.replace(/rgba\(0, 0, 0, 0\)|0px|,|\s/g, '')).toBe('');
    };
    // libui renders a table `visibility: hidden`, at the default width of every column, until its
    // ResizeObserver has measured the container and sized the columns to it. Measuring before then
    // reads that provisional width, which is wider than the page.
    const measuredBody = async (table: Locator) => {
      const body = table.getByTestId('data-table-body');
      await expect(body).toBeVisible();
      return body;
    };
    const clippedHeaders = (table: Locator) => {
      return table
        .getByTestId('data-table-head')
        .locator('button span')
        .evaluateAll((labels) => {
          return labels.filter((label) => label.scrollWidth > label.clientWidth).map((label) => label.textContent);
        });
    };
    const scrollsSideways = (body: Locator) => {
      return body.evaluate((element) => {
        const container = element.parentElement!.parentElement!;
        return container.scrollWidth > container.clientWidth;
      });
    };

    const reposBody = await measuredBody(reposPage.dataTable);
    await expectInvisibleCard();
    expect(await clippedHeaders(reposPage.dataTable)).toEqual([]);
    expect(await scrollsSideways(reposBody)).toBe(false);
    const rowHeight = await reposBody
      .getByTestId('data-table-row')
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(await reposBody.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(
      rowHeight * 5
    );
    const url = reposPage.dataTable.getByTestId('instrument-repo-url');
    await url.click();
    const urlLayout = await url.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      spill: element.getBoundingClientRect().right - element.parentElement!.getBoundingClientRect().right
    }));
    expect(urlLayout.clipped).toBe(true);
    expect(urlLayout.spill).toBeLessThanOrEqual(0);

    await reposPage.openActivityLog();

    const logBody = await measuredBody(reposPage.syncLogTable);
    await expectInvisibleCard();
    expect(await clippedHeaders(reposPage.syncLogTable)).toEqual([]);
    expect(await scrollsSideways(logBody)).toBe(false);
    const repoName = reposPage.syncLogTable.getByTestId('sync-log-repo-name');
    await expect(repoName).toHaveAttribute('title', partialSync.repoName);
    const repoNameLayout = await repoName.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      lines: Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight))
    }));
    expect(repoNameLayout.clipped).toBe(true);
    expect(repoNameLayout.lines).toBe(1);
  });
});
