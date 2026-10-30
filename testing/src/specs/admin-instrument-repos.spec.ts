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

  test('should reject a malformed GitHub URL without making a network request', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.addRepositoryButton.click();
    await reposPage.githubUrlInput.fill('not-a-valid-url');
    await reposPage.importButton.click();

    await expect(reposPage.$ref.getByText('Please enter a valid GitHub repository URL.')).toBeVisible();
    // Client-side rejection, so the dialog stays open on the same page rather than submitting.
    await expect(reposPage.githubUrlInput).toBeVisible();
  });
});

test.describe('admin instrument repos slow import', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should wait out an import slower than the default request timeout and report success', async ({
    getPageModel,
    page
  }) => {
    test.setTimeout(60_000);
    // Answered by the test rather than the API, which must not reach out to GitHub under NODE_ENV=test.
    await page.route('**/v1/instrument-repos', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 12_000);
      });
      return route.fulfill({ json: {}, status: 201 });
    });
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.addRepositoryButton.click();
    await reposPage.githubUrlInput.fill('https://github.com/example/slow-instruments');
    await reposPage.importButton.click();

    await expect(reposPage.$ref.getByText('Repository imported successfully')).toBeVisible({ timeout: 30_000 });
    await expect(reposPage.$ref.getByText('Failed to import repository')).toBeHidden();
  });
});

test.describe('admin instrument repos refused import', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should report a refused import and keep the dialog open with the URL, instead of the error page', async ({
    getPageModel,
    page
  }) => {
    const url = 'https://github.com/example/missing-instruments';
    await page.route('**/v1/instrument-repos', (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      return route.fulfill({
        json: { error: 'Bad Request', message: 'Repository not found', statusCode: 400 },
        status: 400
      });
    });
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.addRepositoryButton.click();
    await reposPage.githubUrlInput.fill(url);
    await reposPage.importButton.click();

    await expect(reposPage.$ref.getByText('Repository not found')).toBeVisible();
    await expect(reposPage.githubUrlInput).toHaveValue(url);
    await expect(reposPage.$ref.getByTestId('error-page')).toBeHidden();
  });
});

test.describe('admin instrument repos activity log', () => {
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
    repoName: repo.name,
    updatedAt: '2026-10-28T00:00:00.000Z'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/instrument-repos', (route) =>
      route.request().method() === 'GET' ? route.fulfill({ json: [repo] }) : route.continue()
    );
    // Regexes, not globs: the history is now requested with query parameters, and its two routes
    // must not match each other.
    await page.route(/\/v1\/instrument-repos\/sync\/logs\/latest/, (route) => route.fulfill({ json: [partialSync] }));
    await page.route(/\/v1\/instrument-repos\/sync\/logs(\?|$)/, (route) =>
      route.request().method() === 'DELETE'
        ? route.fulfill({ json: { count: 1 } })
        : route.fulfill({ json: { data: [partialSync], pageCount: 1, total: 1 } })
    );
  });

  test('should keep a long repository URL inside its column, even on the selected row', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const url = reposPage.dataTable.getByTestId('instrument-repo-url');

    await url.click();

    const overflow = await url.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      spill: element.getBoundingClientRect().right - element.parentElement!.getBoundingClientRect().right
    }));
    expect(overflow.clipped).toBe(true);
    expect(overflow.spill).toBeLessThanOrEqual(0);
  });

  test('should count the failed instruments and explain them in the activity log', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');

    await expect(reposPage.dataTable.getByTestId('instrument-repo-failed-count')).toHaveText('1');
    await reposPage.openActivityLog();
    await expect(reposPage.syncLogTable.getByTestId('sync-log-status')).toHaveText('Partial success');
    await reposPage.syncLogTable.getByTestId('sync-log-view-messages').click();
    const details = reposPage.$ref.getByTestId('sync-log-error-details');
    await expect(details).toContainText('CPP_SERIES');
    await expect(details).toContainText('Load');
  });

  test('should show one table at a time, switching between them by tab', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    await expect(reposPage.dataTable.getByTestId('instrument-repo-url')).toBeVisible();
    await expect(reposPage.syncLogTable).toHaveCount(0);

    await expect(reposPage.sectionTitle).toHaveText('Manage Repositories');

    await reposPage.openActivityLog();

    await expect(reposPage.syncLogTable).toBeVisible();
    await expect(reposPage.sectionTitle).toHaveText('Review Activity');
    await expect(reposPage.$ref.getByTestId('instrument-repo-url')).toHaveCount(0);
  });

  test('should draw no card behind either tab', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const expectInvisible = async () => {
      await expect(reposPage.card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(reposPage.card).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      await expect(reposPage.card).toHaveCSS('box-shadow', 'none');
    };
    await expectInvisible();

    await reposPage.openActivityLog();

    await expectInvisible();
  });

  test('should fit both tables to the page without a horizontal scroll bar', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const overflows = (table: typeof reposPage.dataTable) =>
      table
        .getByTestId('data-table-body')
        .evaluate(
          (body) => body.parentElement!.parentElement!.scrollWidth > body.parentElement!.parentElement!.clientWidth
        );

    expect(await overflows(reposPage.dataTable)).toBe(false);
    await reposPage.openActivityLog();
    expect(await overflows(reposPage.syncLogTable)).toBe(false);
  });

  test('should hold a one-row table open to five rows, so it does not collapse to a sliver', async ({
    getPageModel
  }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const body = reposPage.dataTable.getByTestId('data-table-body');

    const height = await body.evaluate((element) => element.getBoundingClientRect().height);
    const rowHeight = await body
      .getByTestId('data-table-row')
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(rowHeight * 5);
  });

  test('should count zero failed instruments when the whole sync failed, rather than its reason', async ({
    getPageModel,
    page
  }) => {
    const failedSync = { ...partialSync, failures: [], importedCount: 0, message: 'Repository not found' };
    await page.route(/\/v1\/instrument-repos\/sync\/logs\/latest/, (route) => route.fulfill({ json: [failedSync] }));
    const reposPage = await getPageModel('/admin/instrument-repos');

    await expect(reposPage.dataTable.getByTestId('instrument-repo-failed-count')).toHaveText('0');
  });

  test('should clip a long repository name to one line and name it in full on hover', async ({
    getPageModel,
    page
  }) => {
    const repoName = 'LaboratoireDeRecherchePsychiatrique/instruments-cliniques-internes-du-laboratoire';
    await page.route(/\/v1\/instrument-repos\/sync\/logs(\?|$)/, (route) =>
      route.fulfill({ json: { data: [{ ...partialSync, repoName }], pageCount: 1, total: 1 } })
    );
    const reposPage = await getPageModel('/admin/instrument-repos');
    await reposPage.openActivityLog();

    const cell = reposPage.syncLogTable.getByTestId('sync-log-repo-name');

    await expect(cell).toHaveAttribute('title', repoName);
    const layout = await cell.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      lines: Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight))
    }));
    expect(layout.clipped).toBe(true);
    expect(layout.lines).toBe(1);
  });

  test('should keep the failure reason out of the activity log row, and show it in full on View', async ({
    getPageModel
  }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    await reposPage.openActivityLog();

    await expect(reposPage.syncLogTable).not.toContainText('PHQ_9');
    await reposPage.syncLogTable.getByTestId('sync-log-view-messages').click();

    const details = reposPage.$ref.getByTestId('sync-log-error-details');
    await expect(details).toContainText("Series item 'PHQ_9' edition 2 does not exist on this instance");
  });

  test('should say the activity log is empty in one line, rather than render an empty table', async ({
    getPageModel,
    page
  }) => {
    await page.route(/\/v1\/instrument-repos\/sync\/logs(\?|$)/, (route) =>
      route.fulfill({ json: { data: [], pageCount: 0, total: 0 } })
    );
    const reposPage = await getPageModel('/admin/instrument-repos');
    await reposPage.openActivityLog();

    await expect(reposPage.syncLogTable).toHaveText('No imports or syncs recorded yet.');
    await expect(reposPage.syncLogTable.getByTestId('data-table')).toHaveCount(0);
  });

  test('should ask the server for the next page, rather than hold the whole history', async ({
    getPageModel,
    page
  }) => {
    await page.route(/\/v1\/instrument-repos\/sync\/logs(\?|$)/, (route) => {
      const requested = new URL(route.request().url()).searchParams.get('page') ?? '1';
      return route.fulfill({
        json: {
          data: [{ ...partialSync, id: `log-${requested}`, repoName: `Repo on page ${requested}` }],
          pageCount: 2,
          total: 11
        }
      });
    });
    const reposPage = await getPageModel('/admin/instrument-repos');
    await reposPage.openActivityLog();
    await expect(reposPage.syncLogTable).toContainText('Repo on page 1');

    await reposPage.syncLogTable.getByRole('button', { name: '2' }).click();

    await expect(reposPage.syncLogTable).toContainText('Repo on page 2');
  });

  test('should open the activity log of one repository from its row actions', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.selectRowAction(0, 'Logs');

    const dialog = reposPage.$ref.getByRole('dialog');
    await expect(dialog).toContainText(`Activity log of "${repo.name}"`);
    await expect(dialog).toHaveAttribute('aria-describedby', /.+/);
    await expect(dialog.getByTestId('sync-log-status')).toHaveText('Partial success');
  });

  test('should link the viewed repository to its source and offer an instrument search', async ({ getPageModel }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.selectRowAction(0, 'View');

    await expect(reposPage.$ref.getByTestId('instrument-repo-source-link')).toHaveAttribute('href', repo.url);
    await expect(reposPage.$ref.getByPlaceholder('Search instruments...')).toBeVisible();
  });

  test('should sync every repository and warn when one of them had failed instruments', async ({
    getPageModel,
    page
  }) => {
    let syncAllRequested = false;
    await page.route('**/v1/instrument-repos/sync/all', (route) => {
      syncAllRequested = true;
      return route.fulfill({ json: [partialSync] });
    });
    const reposPage = await getPageModel('/admin/instrument-repos');

    await reposPage.syncAllButton.click();

    await expect(reposPage.$ref.getByText('1 of 1 repositories had problems. See the activity log.')).toBeVisible();
    expect(syncAllRequested).toBe(true);
  });

  test('should clear the activity log only after warning that it is deleted from the database', async ({
    getPageModel,
    page
  }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const deleteRequest = page.waitForRequest(
      (request) => request.method() === 'DELETE' && request.url().endsWith('/v1/instrument-repos/sync/logs')
    );

    await reposPage.openActivityLog();
    await reposPage.clearLogButton.click();
    const dialog = reposPage.$ref.getByRole('dialog');
    await expect(dialog).toContainText('permanently deleted from the database');
    await dialog.getByRole('button', { name: 'Yes' }).click();

    await deleteRequest;
    await expect(reposPage.$ref.getByText('Activity log cleared')).toBeVisible();
  });
});
