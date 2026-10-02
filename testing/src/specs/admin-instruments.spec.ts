import { expect, test } from '../support/fixtures';

const API = '/api/v1';

test.describe('admin instruments', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should preview an instrument when its row is double-clicked', async ({ getPageModel, page }) => {
    const title = 'Happiness Questionnaire';
    const instrumentsPage = await getPageModel('/admin/instruments');
    await instrumentsPage.searchBar.fill(title);
    await instrumentsPage.row(title).dblclick();
    await expect(page.getByRole('dialog')).toContainText(title);
  });

  test('should reach the series view from the Instruments submenu in the sidebar', async ({ getPageModel, page }) => {
    await getPageModel('/admin/instruments');
    const sidebar = page.getByTestId('sidebar');
    // The admin links sit in the Admin Panel section, which starts collapsed even on an admin page.
    await sidebar.getByRole('button', { exact: true, name: 'Admin Panel' }).click();
    await sidebar.getByRole('button', { exact: true, name: 'Instruments' }).click();
    await sidebar.getByRole('button', { exact: true, name: 'Series' }).click();
    await expect(page).toHaveURL(/\/admin\/instruments\?view=series/);
    await expect(page.getByTestId('page-header')).toContainText('Series Instruments');
  });

  test('should find a series by searching, listed under the name of the group that owns it', async ({
    api,
    getPageModel,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `SeriesOwner${uniqueId}` });
    const title = `Series ${uniqueId}`;
    await api.createSeries(group.id, title);

    const seriesPage = await getPageModel('/admin/instruments');
    await seriesPage.openSeriesView();
    await seriesPage.searchBar.fill(title);

    await expect(seriesPage.row(title)).toContainText(`SeriesOwner${uniqueId}`);
  });

  test('should archive a series, so no new assignment of it is accepted, and unarchive it again', async ({
    adminToken,
    api,
    apiRequestContext,
    getPageModel,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `SeriesArchive${uniqueId}` });
    const title = `Series ${uniqueId}`;
    const seriesId = await api.createSeries(group.id, title);
    const subjectId = await api.createSubject(group.id);

    const seriesPage = await getPageModel('/admin/instruments');
    await seriesPage.openSeriesView();
    await seriesPage.searchBar.fill(title);
    await seriesPage.chooseRowAction(title, 'Archive');
    await expect(seriesPage.archiveDialog).toContainText(`SeriesArchive${uniqueId}`);
    await seriesPage.confirmArchive.click();
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'true');

    const assignment = await apiRequestContext.post(`${API}/assignments`, {
      data: { expiresAt: new Date(Date.now() + 86_400_000), groupId: group.id, instrumentId: seriesId, subjectId },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(assignment.status(), await assignment.text()).toBe(422);

    await seriesPage.chooseRowAction(title, 'Unarchive');
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'false');
  });

  test('should archive an active series on a double-click, through the confirmation, and unarchive an archived one', async ({
    api,
    getPageModel,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `SeriesDoubleClick${uniqueId}` });
    const title = `Series ${uniqueId}`;
    await api.createSeries(group.id, title);

    const seriesPage = await getPageModel('/admin/instruments');
    await seriesPage.openSeriesView();
    await seriesPage.searchBar.fill(title);
    await seriesPage.row(title).dblclick();
    await seriesPage.confirmArchive.click();
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'true');

    await seriesPage.row(title).dblclick();
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'false');
  });
});
