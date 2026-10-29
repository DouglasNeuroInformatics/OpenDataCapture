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
    await page.route('**/v1/instrument-repos/sync/logs', (route) =>
      route.request().method() === 'DELETE'
        ? route.fulfill({ json: { count: 1 } })
        : route.fulfill({ json: [partialSync] })
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
    await expect(reposPage.syncLogTable.getByTestId('sync-log-status')).toHaveText('Partial success');
    const messages = reposPage.syncLogTable.getByTestId('sync-log-messages');
    await expect(messages).toContainText('CPP_SERIES');
    await expect(messages).toContainText('Load');
  });

  test('should keep a long failure reason to one line in its cell, and show it in full on View', async ({
    getPageModel
  }) => {
    const reposPage = await getPageModel('/admin/instrument-repos');
    const summary = reposPage.syncLogTable.getByTestId('sync-log-messages');

    const layout = await summary.evaluate((element) => ({
      clipped: element.scrollWidth > element.clientWidth,
      lines: Math.round(
        element.getBoundingClientRect().height / Number.parseFloat(window.getComputedStyle(element).lineHeight)
      )
    }));
    expect(layout.clipped).toBe(true);
    expect(layout.lines).toBe(1);

    await reposPage.syncLogTable.getByTestId('sync-log-view-messages').click();

    const details = reposPage.$ref.getByTestId('sync-log-error-details');
    await expect(details).toContainText('CPP_SERIES');
    await expect(details).toContainText('Load');
    await expect(details).toContainText("Series item 'PHQ_9' edition 2 does not exist on this instance");
  });

  test('should say the activity log is empty in one line, rather than render an empty table', async ({
    getPageModel,
    page
  }) => {
    await page.route(/\/v1\/instrument-repos\/sync\/logs/, (route) => route.fulfill({ json: [] }));
    const reposPage = await getPageModel('/admin/instrument-repos');

    await expect(reposPage.syncLogTable).toHaveText('No imports or syncs recorded yet.');
    await expect(reposPage.syncLogTable.getByTestId('data-table')).toHaveCount(0);
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

    await reposPage.clearLogButton.click();
    const dialog = reposPage.$ref.getByRole('dialog');
    await expect(dialog).toContainText('permanently deleted from the database');
    await dialog.getByRole('button', { name: 'Yes' }).click();

    await deleteRequest;
    await expect(reposPage.$ref.getByText('Activity log cleared')).toBeVisible();
  });
});
