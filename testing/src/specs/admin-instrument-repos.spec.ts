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
