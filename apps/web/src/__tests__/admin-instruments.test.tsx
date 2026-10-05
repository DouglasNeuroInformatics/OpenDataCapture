import type { Group } from '@opendatacapture/schemas/group';
import type { SeriesInstrumentOverview, TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentPreviewItem } from '@/components/InstrumentPreviewDialog';
import { Route } from '@/routes/_app/admin/instruments';

import '@/services/i18n';

type PreviewProps = { item: InstrumentPreviewItem; items: { id: string; title: string }[]; onClose: () => void };

const mocks = vi.hoisted(() => ({
  archive: { isPending: false, mutate: vi.fn() },
  groups: [] as Group[],
  groupsQueryOptions: vi.fn(() => ({ queryKey: ['groups'] })),
  instrumentInfo: undefined as TranslatedInstrumentInfo[] | undefined,
  InstrumentPreviewDialog: vi.fn(({ item, onClose }: PreviewProps) => (
    <div data-testid="preview-dialog" data-title={item.title}>
      <button aria-label="Close preview" type="button" onClick={onClose} />
    </div>
  )),
  seriesInstrumentsOverviewQueryOptions: vi.fn(() => ({ queryKey: ['series-instruments-overview'] })),
  seriesOverview: [] as SeriesInstrumentOverview[]
}));

vi.mock('@/components/InstrumentPreviewDialog', () => ({ InstrumentPreviewDialog: mocks.InstrumentPreviewDialog }));
vi.mock('@/hooks/useGroupsQuery', () => ({
  groupsQueryOptions: mocks.groupsQueryOptions,
  useGroupsQuery: () => ({ data: mocks.groups })
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({ useInstrumentInfoQuery: () => ({ data: mocks.instrumentInfo }) }));
vi.mock('@/hooks/useSeriesInstrumentsOverviewQuery', () => ({
  seriesInstrumentsOverviewQueryOptions: mocks.seriesInstrumentsOverviewQueryOptions,
  useSeriesInstrumentsOverviewQuery: () => ({ data: mocks.seriesOverview })
}));
vi.mock('@/hooks/useUpdateSeriesInstrumentArchiveMutation', () => ({
  useUpdateSeriesInstrumentArchiveMutation: () => mocks.archive
}));

const scalarFixture = ({
  createdAt = null,
  edition = 1,
  id,
  kind = 'FORM',
  name = id,
  sourceRepo = null,
  title
}: {
  createdAt?: Date | null;
  edition?: number;
  id: string;
  kind?: 'FILE' | 'FORM' | 'INTERACTIVE';
  name?: string;
  sourceRepo?: null | { id: string; name: null | string };
  title: string;
}): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  createdAt,
  details: { authors: ['Jane Doe'], description: `${title} description`, license: 'MIT', title },
  id,
  internal: { edition, name },
  kind,
  language: 'en',
  sourceRepo,
  supportedLanguages: ['en'],
  tags: []
});

const seriesInfoFixture = (): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  details: { authors: null, description: 'Battery description', license: 'MIT', title: 'Baseline Battery' },
  id: 'series-1',
  kind: 'SERIES',
  language: 'en',
  seriesItems: [],
  supportedLanguages: ['en'],
  tags: []
});

const overviewFixture = ({
  archivedAt = null,
  createdAt = null,
  id = 'series-1',
  seriesGroup = null,
  sourceRepo = null,
  title = 'Baseline Battery'
}: {
  archivedAt?: Date | null;
  createdAt?: Date | null;
  id?: string;
  seriesGroup?: null | { id: string; name: string };
  sourceRepo?: null | { id: string; name: null | string };
  title?: string;
} = {}): SeriesInstrumentOverview => ({
  __runtimeVersion: 1,
  archivedAt,
  createdAt,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  kind: 'SERIES',
  language: 'en',
  seriesGroup,
  seriesItems: [{ id: 'form-1' }],
  sourceRepo,
  tags: []
});

const groupFixture = (name: string, accessibleInstrumentIds: string[]): Group => ({
  accessibleInstrumentIds,
  createdAt: new Date('2026-01-01'),
  id: name,
  instrumentRepoIds: [],
  name,
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'RESEARCH',
  updatedAt: new Date('2026-01-01'),
  userIds: []
});

const renderPage = (view?: 'forms' | 'series') => {
  vi.spyOn(Route, 'useSearch').mockReturnValue({ view });
  const Component = Route.options.component!;
  render(<Component />);
};

const rows = () => screen.getAllByTestId('data-table-row');

const cellTexts = (rowIndex = 0) =>
  [...rows()[rowIndex]!.querySelectorAll('span[title]')].map((cell) => cell.getAttribute('title'));

const rowAction = (label: string, rowIndex = 0) => {
  fireEvent.keyDown(within(rows()[rowIndex]!).getByTestId('row-actions-trigger'), { key: 'Enter' });
  return within(screen.getByTestId('row-actions-dropdown')).getByRole('menuitem', { name: label });
};

const lastPreviewProps = () => mocks.InstrumentPreviewDialog.mock.lastCall![0];

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.archive = { isPending: false, mutate: vi.fn() };
  mocks.groups = [];
  mocks.instrumentInfo = undefined;
  mocks.seriesOverview = [];
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('admin instruments page', () => {
  it('should prefetch the series overview and groups in the loader, so either view renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData.mock.calls).toEqual([
      [{ queryKey: ['series-instruments-overview'] }],
      [{ queryKey: ['groups'] }]
    ]);
  });

  it('should open the forms view when no view is requested', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Form & Interactive Instruments' })).toBeTruthy();
    expect(screen.getByText('No instruments have been added yet.')).toBeTruthy();
  });

  it('should open the series view when it is requested', () => {
    renderPage('series');
    expect(screen.getByRole('heading', { name: 'Series Instruments' })).toBeTruthy();
    expect(screen.getByText('No series instruments have been created yet.')).toBeTruthy();
  });
});

describe('admin instruments forms view', () => {
  it('should list only the latest edition of each instrument, leaving out series', () => {
    mocks.instrumentInfo = [
      scalarFixture({ edition: 1, id: 'happiness-1', name: 'happiness', title: 'Happiness v1' }),
      scalarFixture({ edition: 2, id: 'happiness-2', name: 'happiness', title: 'Happiness v2' }),
      seriesInfoFixture()
    ];
    renderPage('forms');
    expect(rows().map((row) => row.querySelector('span[title]')!.textContent)).toEqual(['Happiness v2']);
  });

  it('should sort the instruments by title', () => {
    mocks.instrumentInfo = [
      scalarFixture({ id: 'b', title: 'Breakfast' }),
      scalarFixture({ id: 'a', title: 'Anxiety' })
    ];
    renderPage();
    expect(rows().map((row) => row.querySelector('span[title]')!.textContent)).toEqual(['Anxiety', 'Breakfast']);
  });

  it('should describe a manually uploaded instrument used by no group', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' })];
    renderPage();
    expect(cellTexts()).toEqual(['Happiness', 'Manual', 'None', 'Form', '1', '-']);
  });

  it('should name the repository an instrument came from and every group using it', () => {
    mocks.groups = [groupFixture('Group A', ['form-1']), groupFixture('Group B', ['form-1']), groupFixture('C', [])];
    mocks.instrumentInfo = [
      scalarFixture({
        createdAt: new Date('2026-03-04T12:00:00Z'),
        id: 'form-1',
        kind: 'INTERACTIVE',
        sourceRepo: { id: 'repo-1', name: 'Core Repo' },
        title: 'Reaction Task'
      })
    ];
    renderPage();
    expect(cellTexts()).toEqual(['Reaction Task', 'Core Repo', 'Group A, Group B', 'Interactive', '1', '2026-03-04']);
  });

  it('should label a file instrument from a repository whose name was never stored', () => {
    mocks.instrumentInfo = [
      scalarFixture({ id: 'file-1', kind: 'FILE', sourceRepo: { id: 'repo-1', name: null }, title: 'Scan' })
    ];
    renderPage();
    expect(cellTexts().slice(1, 4)).toEqual(['Unknown repository', 'None', 'File']);
  });

  it('should preview an instrument from its row action, offering every scalar instrument to name items by', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' }), seriesInfoFixture()];
    renderPage();
    fireEvent.click(rowAction('Preview'));
    expect(lastPreviewProps().item).toMatchObject({
      authors: ['Jane Doe'],
      availability: null,
      id: 'form-1',
      internal: { edition: 1, name: 'form-1' },
      source: { kind: 'manual' },
      title: 'Happiness'
    });
    expect(lastPreviewProps().items).toEqual([{ id: 'form-1', title: 'Happiness' }]);
  });

  it('should do nothing on a single click, since only a double click previews', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' })];
    renderPage();
    fireEvent.click(rows()[0]!);
    expect(screen.queryByTestId('preview-dialog')).toBeNull();
  });

  it('should preview an instrument on a double click', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' })];
    renderPage();
    fireEvent.doubleClick(rows()[0]!);
    expect(screen.getByTestId('preview-dialog').getAttribute('data-title')).toBe('Happiness');
  });

  it('should close the preview when the dialog asks to', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' })];
    renderPage();
    fireEvent.doubleClick(rows()[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.queryByTestId('preview-dialog')).toBeNull();
  });
});

describe('admin instruments series view', () => {
  it('should describe an active series shared across every group', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    expect(cellTexts()).toEqual(['Baseline Battery', 'All groups', '-', 'Active']);
    expect(screen.getByTestId('series-status').getAttribute('data-archived')).toBe('false');
  });

  it('should describe an archived series owned by a group, with the date it was archived', () => {
    mocks.seriesOverview = [
      overviewFixture({
        archivedAt: new Date('2026-09-02T12:00:00Z'),
        createdAt: new Date('2026-02-01T12:00:00Z'),
        seriesGroup: { id: 'group-1', name: 'Group One' }
      })
    ];
    renderPage('series');
    expect(cellTexts()).toEqual(['Baseline Battery', 'Group One', '2026-02-01', 'Archived on 2026-09-02']);
    expect(screen.getByTestId('series-status').getAttribute('data-archived')).toBe('true');
  });

  it('should list active series before archived ones', () => {
    mocks.seriesOverview = [
      overviewFixture({ archivedAt: new Date('2026-09-02'), id: 'series-a', title: 'Alpha' }),
      overviewFixture({ id: 'series-b', title: 'Beta' })
    ];
    renderPage('series');
    expect(rows().map((row) => row.querySelector('span[title]')!.textContent)).toEqual(['Beta', 'Alpha']);
  });

  it('should preview a series with the group it is available to and the repository it came from', () => {
    mocks.instrumentInfo = [scalarFixture({ id: 'form-1', title: 'Happiness' })];
    mocks.seriesOverview = [
      overviewFixture({
        seriesGroup: { id: 'group-1', name: 'Group One' },
        sourceRepo: { id: 'repo-1', name: 'Core Repo' }
      })
    ];
    renderPage('series');
    fireEvent.click(rowAction('Preview'));
    expect(lastPreviewProps().item).toMatchObject({
      availability: { kind: 'group', name: 'Group One' },
      internal: null,
      seriesItems: [{ id: 'form-1' }],
      source: { kind: 'repo', name: 'Core Repo' },
      title: 'Baseline Battery'
    });
    expect(lastPreviewProps().items).toEqual([{ id: 'form-1', title: 'Happiness' }]);
  });

  it('should preview a shared series as available to all groups', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Preview'));
    expect(lastPreviewProps().item.availability).toEqual({ kind: 'all' });
  });

  it('should close the series preview when the dialog asks to', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Preview'));
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.queryByTestId('preview-dialog')).toBeNull();
  });

  it('should not offer to archive a series that is already archived', () => {
    mocks.seriesOverview = [overviewFixture({ archivedAt: new Date('2026-09-02') })];
    renderPage('series');
    expect(rowAction('Archive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should not offer to unarchive a series that is active', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    expect(rowAction('Unarchive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should not offer to unarchive while another unarchive is in flight', () => {
    mocks.archive.isPending = true;
    mocks.seriesOverview = [overviewFixture({ archivedAt: new Date('2026-09-02') })];
    renderPage('series');
    expect(rowAction('Unarchive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should unarchive a series straight from the row action, since it is not destructive', () => {
    mocks.seriesOverview = [overviewFixture({ archivedAt: new Date('2026-09-02') })];
    renderPage('series');
    fireEvent.click(rowAction('Unarchive'));
    expect(mocks.archive.mutate).toHaveBeenCalledWith({ id: 'series-1', isArchived: false });
  });

  it('should ask for confirmation before archiving, naming the group the series belongs to', () => {
    mocks.seriesOverview = [overviewFixture({ seriesGroup: { id: 'group-1', name: 'Group One' } })];
    renderPage('series');
    fireEvent.click(rowAction('Archive'));
    expect(
      within(screen.getByTestId('archive-series-dialog')).getByText(/^"Baseline Battery" \(Group One\)/)
    ).toBeTruthy();
    expect(mocks.archive.mutate).not.toHaveBeenCalled();
  });

  it('should ask for confirmation before archiving an active series on a double click', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.doubleClick(rows()[0]!);
    expect(
      within(screen.getByTestId('archive-series-dialog')).getByText(/^"Baseline Battery" \(All groups\)/)
    ).toBeTruthy();
  });

  it('should unarchive an archived series straight away on a double click, since it is not destructive', () => {
    mocks.seriesOverview = [overviewFixture({ archivedAt: new Date('2026-09-02') })];
    renderPage('series');
    fireEvent.doubleClick(rows()[0]!);
    expect(mocks.archive.mutate).toHaveBeenCalledWith({ id: 'series-1', isArchived: false });
  });

  it('should ignore a double click while an archive change is in flight, so it is not sent twice', () => {
    mocks.archive.isPending = true;
    mocks.seriesOverview = [overviewFixture({ archivedAt: new Date('2026-09-02') })];
    renderPage('series');
    fireEvent.doubleClick(rows()[0]!);
    expect(mocks.archive.mutate).not.toHaveBeenCalled();
  });

  it('should do nothing on a single click, since only a double click toggles the archive status', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rows()[0]!);
    expect(screen.queryByTestId('archive-series-dialog')).toBeNull();
  });

  it('should archive the series once the confirmation is accepted, closing it when the request settles', () => {
    mocks.archive.mutate.mockImplementation((_: unknown, options: { onSettled: () => void }) => options.onSettled());
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByTestId('confirm-archive-series'));
    expect(mocks.archive.mutate).toHaveBeenCalledWith({ id: 'series-1', isArchived: true }, expect.anything());
    expect(screen.queryByTestId('archive-series-dialog')).toBeNull();
  });

  it('should disable the confirmation while the archive request is in flight', () => {
    mocks.archive.isPending = true;
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Archive'));
    expect(screen.getByTestId<HTMLButtonElement>('confirm-archive-series').disabled).toBe(true);
  });

  it('should close the confirmation without archiving when it is cancelled', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('archive-series-dialog')).toBeNull();
    expect(mocks.archive.mutate).not.toHaveBeenCalled();
  });

  it('should close the confirmation without archiving when it is dismissed', () => {
    mocks.seriesOverview = [overviewFixture()];
    renderPage('series');
    fireEvent.click(rowAction('Archive'));
    fireEvent.keyDown(screen.getByTestId('archive-series-dialog'), { key: 'Escape' });
    expect(screen.queryByTestId('archive-series-dialog')).toBeNull();
    expect(mocks.archive.mutate).not.toHaveBeenCalled();
  });
});
