import { expect, test } from '../support/fixtures';

test.describe('admin instruments', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should tag the kind of an instrument and preview it when its row is double-clicked', async ({
    getPageModel,
    page
  }) => {
    const title = 'Happiness Questionnaire';
    const instrumentsPage = await getPageModel('/admin/instruments');
    await instrumentsPage.searchBar.fill(title);
    await expect(instrumentsPage.row(title).getByTestId('instrument-cell-kind')).toHaveText('Form');

    await instrumentsPage.row(title).dblclick();

    await expect(page.getByRole('dialog')).toContainText(title);
  });

  test('should find a series under the group that owns it, archive it and unarchive it again', async ({
    api,
    getPageModel,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `SeriesArchive${uniqueId}` });
    const title = `Series ${uniqueId}`;
    await api.createSeries(group.id, title);

    const seriesPage = await getPageModel('/admin/instruments');
    await seriesPage.openSeriesView();
    await seriesPage.searchBar.fill(title);
    await expect(seriesPage.row(title)).toContainText(`SeriesArchive${uniqueId}`);

    await seriesPage.chooseRowAction(title, 'Archive');
    await expect(seriesPage.archiveDialog).toContainText(`SeriesArchive${uniqueId}`);
    await seriesPage.confirmArchive.click();
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'true');

    await seriesPage.chooseRowAction(title, 'Unarchive');
    await expect(seriesPage.seriesStatus(title)).toHaveAttribute('data-archived', 'false');
  });
});
