import { expect, test } from '../support/fixtures';

// Importing a repository clones real instruments from GitHub server-side (see
// `InstrumentReposService.create` in `apps/api`), and `SetupService` explicitly skips seeding the
// default repository when `NODE_ENV=test` "which must not reach out to GitHub". So this suite cannot
// safely exercise a successful import, sync, or delete -- see BUGS.md.

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
