import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Group } from '@opendatacapture/schemas/group';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { InstrumentRepo, InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/instrument-repos/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  clearSyncLogs: vi.fn(),
  createRepo: vi.fn(),
  deleteRepo: vi.fn(),
  groups: [] as Group[],
  groupsQueryOptions: vi.fn(() => ({ queryKey: ['groups'] })),
  instrumentInfo: { data: undefined as TranslatedInstrumentInfo[] | undefined, isLoading: false },
  instrumentReposQueryOptions: vi.fn(() => ({ queryKey: ['instrument-repos'] })),
  isCreatePending: false,
  latestSyncLogs: [] as InstrumentRepoSyncLog[],
  latestSyncLogsQueryOptions: vi.fn(() => ({ queryKey: ['instrument-repo-sync-logs', 'latest'] })),
  repos: [] as InstrumentRepo[],
  syncAllRepos: vi.fn(),
  syncLogs: [] as InstrumentRepoSyncLog[],
  syncLogsParams: [] as { page?: number; repoId?: string; sortOrder?: string }[],
  syncLogsPending: false,
  syncLogsQueryOptions: vi.fn(() => ({ queryKey: ['instrument-repo-sync-logs'] })),
  syncRepo: vi.fn()
}));

vi.mock('@/hooks/useInstrumentReposQuery', () => ({
  instrumentReposQueryOptions: mocks.instrumentReposQueryOptions,
  useInstrumentReposQuery: () => ({ data: mocks.repos })
}));
vi.mock('@/hooks/useGroupsQuery', () => ({
  groupsQueryOptions: mocks.groupsQueryOptions,
  useGroupsQuery: () => ({ data: mocks.groups })
}));
vi.mock('@/hooks/useInstrumentInfoQuery', () => ({ useInstrumentInfoQuery: () => mocks.instrumentInfo }));
vi.mock('@/hooks/useClearInstrumentRepoSyncLogsMutation', () => ({
  useClearInstrumentRepoSyncLogsMutation: () => ({ isPending: false, mutate: mocks.clearSyncLogs })
}));
vi.mock('@/hooks/useCreateInstrumentRepoMutation', () => ({
  useCreateInstrumentRepoMutation: () => ({ isPending: mocks.isCreatePending, mutate: mocks.createRepo })
}));
vi.mock('@/hooks/useDeleteInstrumentRepoMutation', () => ({
  useDeleteInstrumentRepoMutation: () => ({ mutate: mocks.deleteRepo })
}));
vi.mock('@/hooks/useSyncInstrumentRepoMutation', () => ({
  useSyncInstrumentRepoMutation: () => ({ mutate: mocks.syncRepo })
}));
vi.mock('@/hooks/useSyncAllInstrumentReposMutation', () => ({
  useSyncAllInstrumentReposMutation: () => ({ isPending: false, mutate: mocks.syncAllRepos })
}));
vi.mock('@/hooks/useInstrumentRepoSyncLogsQuery', () => ({
  INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY: 'instrument-repo-sync-logs',
  instrumentRepoSyncLogsQueryOptions: mocks.syncLogsQueryOptions,
  useInstrumentRepoSyncLogsQuery: ({ params }: { params?: { repoId?: string } } = {}) => {
    mocks.syncLogsParams.push(params ?? {});
    if (mocks.syncLogsPending) {
      return { data: undefined };
    }
    const data = params?.repoId ? mocks.syncLogs.filter((log) => log.repoId === params.repoId) : mocks.syncLogs;
    return { data: { data, pageCount: 1, total: data.length } };
  }
}));
vi.mock('@/hooks/useLatestInstrumentRepoSyncLogsQuery', () => ({
  latestInstrumentRepoSyncLogsQueryOptions: mocks.latestSyncLogsQueryOptions,
  useLatestInstrumentRepoSyncLogsQuery: () => ({ data: mocks.latestSyncLogs })
}));

const repoFixture = (overrides: Partial<InstrumentRepo> = {}): InstrumentRepo => ({
  createdAt: new Date('2026-01-01'),
  groupIds: [],
  id: 'repo-1',
  instrumentIds: ['form-1', 'form-2'],
  lastSyncedAt: null,
  name: 'Core Repo',
  owner: 'douglasneuroinformatics',
  repoName: 'core',
  updatedAt: new Date('2026-01-01'),
  url: 'https://github.com/douglasneuroinformatics/core',
  ...overrides
});

const syncLogFixture = (overrides: Partial<InstrumentRepoSyncLog> = {}): InstrumentRepoSyncLog => ({
  action: 'SYNC',
  createdAt: new Date('2026-10-01'),
  failures: [],
  id: 'log-1',
  importedCount: 2,
  message: null,
  repoId: 'repo-1',
  repoName: 'Core Repo',
  updatedAt: new Date('2026-10-01'),
  ...overrides
});

const groupFixture = (instrumentRepoIds: string[]): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds,
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'RESEARCH',
  updatedAt: new Date('2026-01-01'),
  userIds: []
});

/**
 * `internalName` is what identifies the same instrument across editions, so two editions of one
 * form are two fixtures sharing it. It is a parameter rather than something a caller overrides
 * afterwards because spreading this union and re-adding `internal` makes the property fresh, and
 * it is then checked against the series branch of {@link TranslatedInstrumentInfo}, which has none.
 */
const scalarFixture = ({
  edition = 1,
  id,
  internalName = id,
  sourceRepo = { id: 'repo-1', name: 'Core Repo' },
  title
}: {
  edition?: number;
  id: string;
  internalName?: string;
  sourceRepo?: null | { id: string; name: null | string };
  title: string;
}): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  internal: { edition, name: internalName },
  kind: 'FORM',
  language: 'en',
  sourceRepo,
  supportedLanguages: ['en'],
  tags: []
});

const seriesFixture = ({ id, title }: { id: string; title: string }): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  kind: 'SERIES',
  language: 'en',
  seriesItems: [],
  sourceRepo: { id: 'repo-1', name: 'Core Repo' },
  supportedLanguages: ['en'],
  tags: []
});

const renderPage = (repos: InstrumentRepo[] = [repoFixture()]) => {
  mocks.repos = repos;
  const Component = Route.options.component!;
  render(<Component />);
};

const rows = () => screen.getAllByTestId('data-table-row');

const rowAction = (label: string, rowIndex = 0) => {
  fireEvent.keyDown(within(rows()[rowIndex]!).getByTestId('row-actions-trigger'), { key: 'Enter' });
  return within(screen.getByTestId('row-actions-dropdown')).getByRole('menuitem', { name: label });
};

const openAddDialog = () => fireEvent.click(screen.getByRole('button', { name: 'Add Repository' }));

const submitAddForm = ({ accessToken = '', url }: { accessToken?: string; url: string }) => {
  fireEvent.change(screen.getByLabelText('GitHub URL'), { target: { value: url } });
  fireEvent.change(screen.getByLabelText('Personal Access Token (optional*)'), { target: { value: accessToken } });
  fireEvent.click(screen.getByRole('button', { name: 'Import' }));
};

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

describe('Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.groups = [];
    mocks.instrumentInfo = { data: undefined, isLoading: false };
    mocks.isCreatePending = false;
    mocks.syncLogs = [];
    mocks.latestSyncLogs = [];
    mocks.syncLogsParams = [];
    mocks.syncLogsPending = false;
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  it('should prefetch the repositories, groups, first page and latest entries in the loader', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData.mock.calls).toEqual([
      [{ queryKey: ['instrument-repos'] }],
      [{ queryKey: ['groups'] }],
      [{ queryKey: ['instrument-repo-sync-logs'] }],
      [{ queryKey: ['instrument-repo-sync-logs', 'latest'] }]
    ]);
  });

  it('should start every prefetch before awaiting any, so the page does not wait out four round trips', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    const loading = runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledTimes(4);
    await loading;
  });

  it('should truncate a long URL in its cell and keep the full URL on hover, so it cannot run into the next column', () => {
    renderPage();
    const cell = within(rows()[0]!).getByTestId('instrument-repo-url');
    expect(cell.className).toContain('text-ellipsis');
    expect(cell.title).toBe('https://github.com/douglasneuroinformatics/core');
  });

  it("should count the instruments that failed in each repository's latest entry", () => {
    mocks.latestSyncLogs = [syncLogFixture({ failures: [{ instrumentDir: 'A', message: 'broken', stage: 'LOAD' }] })];
    renderPage();
    expect(within(rows()[0]!).getByTestId('instrument-repo-failed-count').textContent).toBe('1');
  });

  it('should ignore an entry with no repository, since a failed import is recorded before one exists', () => {
    mocks.latestSyncLogs = [
      syncLogFixture({ id: 'orphan', message: 'Repository not found', repoId: null }),
      syncLogFixture({ failures: [{ instrumentDir: 'A', message: 'broken', stage: 'LOAD' }], id: 'log-1' })
    ];
    renderPage();
    expect(within(rows()[0]!).getByTestId('instrument-repo-failed-count').textContent).toBe('1');
  });

  it('should show a dash for the failed count of a repository with no activity log', () => {
    renderPage();
    expect(within(rows()[0]!).queryByTestId('instrument-repo-failed-count')).toBeNull();
  });

  it('should say the repository could not be read when the whole import or sync failed', () => {
    mocks.latestSyncLogs = [syncLogFixture({ message: 'Repository not found' })];
    renderPage();
    expect(within(rows()[0]!).getByTestId('instrument-repo-failed-count').textContent).toBe('Could not be read');
  });

  it('should render an empty activity log while its first page is still in flight', () => {
    mocks.syncLogsPending = true;
    renderPage();
    expect(screen.getByText('No imports or syncs recorded yet.')).toBeTruthy();
  });

  it('should ask the server for the other order when the activity log is sorted by date', () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();
    const log = within(screen.getByTestId('instrument-repo-sync-log'));

    fireEvent.click(within(log.getByTestId('data-table-head')).getByText('Date'));

    expect(mocks.syncLogsParams.at(-1)).toMatchObject({ page: 1, sortOrder: 'asc' });
  });

  it("should request one repository's own entries in its dialog, rather than filter the page on screen", () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();

    fireEvent.click(rowAction('Logs'));

    expect(mocks.syncLogsParams.some((params) => params.repoId === 'repo-1')).toBe(true);
  });

  it('should sync every repository from the Sync All button', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Sync All' }));
    expect(mocks.syncAllRepos).toHaveBeenCalledOnce();
  });

  it('should disable Sync All when there is no repository to sync', () => {
    renderPage([]);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sync All' }).disabled).toBe(true);
  });

  it('should show the activity log of every repository below the table', () => {
    mocks.syncLogs = [syncLogFixture(), syncLogFixture({ id: 'log-2', repoId: 'repo-2', repoName: 'Other Repo' })];
    renderPage();
    const history = screen.getByTestId('instrument-repo-sync-log');
    expect(within(history).getByText('Core Repo')).toBeTruthy();
    expect(within(history).getByText('Other Repo')).toBeTruthy();
  });

  it('should not offer to clear an empty activity log', () => {
    renderPage();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Clear Log' }).disabled).toBe(true);
  });

  it('should warn that clearing the history deletes it from the database before doing so', () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));
    expect(screen.getByText('Clear the activity log?')).toBeTruthy();
    expect(screen.getByRole('dialog').textContent).toContain('permanently deleted from the database');
    expect(mocks.clearSyncLogs).not.toHaveBeenCalled();
  });

  it('should clear the history once the warning is accepted', () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mocks.clearSyncLogs).toHaveBeenCalledOnce();
    expect(screen.queryByText('Clear the activity log?')).toBeNull();
  });

  it('should keep the history when the warning is declined', () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(mocks.clearSyncLogs).not.toHaveBeenCalled();
    expect(screen.queryByText('Clear the activity log?')).toBeNull();
  });

  it('should show only the selected repository in its logs dialog', () => {
    mocks.syncLogs = [syncLogFixture(), syncLogFixture({ id: 'log-2', repoId: 'repo-2', repoName: 'Other Repo' })];
    renderPage();
    fireEvent.click(rowAction('Logs'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Activity log of "Core Repo"')).toBeTruthy();
    expect(within(dialog).queryByText('Other Repo')).toBeNull();
  });

  it('should describe the logs dialog, since a dialog without one is announced with its title alone', () => {
    mocks.syncLogs = [syncLogFixture()];
    renderPage();
    fireEvent.click(rowAction('Logs'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(within(dialog).getByText('Every import and sync of this repository, newest first.')).toBeTruthy();
  });

  it('should count the instruments a repository contributed', () => {
    renderPage();
    expect(within(rows()[0]!).getByText('2')).toBeTruthy();
  });

  it('should show a dash for a repository that has never been synced', () => {
    // A latest entry keeps the failed count from rendering a dash of its own.
    mocks.latestSyncLogs = [syncLogFixture()];
    renderPage();
    expect(within(rows()[0]!).getByText('-')).toBeTruthy();
  });

  it('should show the date a repository was last synced', () => {
    const lastSyncedAt = new Date('2026-09-01T12:00:00Z');
    renderPage([repoFixture({ lastSyncedAt })]);
    expect(within(rows()[0]!).getByText(lastSyncedAt.toLocaleDateString())).toBeTruthy();
  });

  it('should highlight the row that was clicked', () => {
    renderPage([repoFixture(), repoFixture({ id: 'repo-2', name: 'Other Repo' })]);
    fireEvent.click(rows()[1]!);
    const selection = rows().map((row) => row.querySelector('[data-row-selected]')!.getAttribute('data-row-selected'));
    expect(selection).toEqual(['false', 'true']);
  });

  it('should sync a repository on a double click', () => {
    renderPage();
    fireEvent.doubleClick(rows()[0]!);
    expect(mocks.syncRepo).toHaveBeenCalledWith({ id: 'repo-1' });
  });

  it('should sync a repository from the sync action', () => {
    renderPage();
    fireEvent.click(rowAction('Sync'));
    expect(mocks.syncRepo).toHaveBeenCalledWith({ id: 'repo-1' });
  });

  it('should show a spinner instead of the form while a repository is importing', () => {
    mocks.isCreatePending = true;
    renderPage();
    openAddDialog();
    expect(screen.getByText('Importing instruments from GitHub...')).toBeTruthy();
    expect(screen.queryByLabelText('GitHub URL')).toBeNull();
  });

  it('should refuse a URL that is not a GitHub repository, rather than sending it to the server', () => {
    renderPage();
    openAddDialog();
    submitAddForm({ url: 'https://gitlab.com/owner/repository' });
    expect(screen.getByText('Please enter a valid GitHub repository URL.')).toBeTruthy();
    expect(mocks.createRepo).not.toHaveBeenCalled();
  });

  it('should omit a blank access token, since public repositories need none', () => {
    renderPage();
    openAddDialog();
    submitAddForm({ accessToken: '   ', url: ' https://github.com/owner/repository ' });
    expect(mocks.createRepo).toHaveBeenCalledWith(
      { data: { url: 'https://github.com/owner/repository' } },
      expect.anything()
    );
  });

  it('should send a trimmed access token for a private repository', () => {
    renderPage();
    openAddDialog();
    submitAddForm({ accessToken: ' ghp_secret ', url: 'https://github.com/owner/repository' });
    expect(mocks.createRepo).toHaveBeenCalledWith(
      { data: { accessToken: 'ghp_secret', url: 'https://github.com/owner/repository' } },
      expect.anything()
    );
  });

  it('should close the add dialog once the import succeeds', () => {
    mocks.createRepo.mockImplementationOnce((_: unknown, options: { onSuccess: () => void }) => options.onSuccess());
    renderPage();
    openAddDialog();
    submitAddForm({ url: 'https://github.com/owner/repository' });
    expect(screen.queryByText('Add Instrument Repository')).toBeNull();
  });

  it('should close the add dialog when it is dismissed', () => {
    renderPage();
    openAddDialog();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByText('Add Instrument Repository')).toBeNull();
  });

  it('should show a spinner in the view dialog while the instruments are loading', () => {
    mocks.instrumentInfo = { data: undefined, isLoading: true };
    renderPage();
    fireEvent.click(rowAction('View'));
    expect(within(screen.getByRole('dialog')).queryByText('No instruments found in this repository.')).toBeNull();
    expect(screen.getByText('Instruments in "Core Repo"')).toBeTruthy();
  });

  it('should say a repository has no instruments when the instrument info is unavailable', () => {
    renderPage();
    fireEvent.click(rowAction('View'));
    expect(screen.getByText('No instruments found in this repository.')).toBeTruthy();
  });

  it('should list only the instruments that came from the viewed repository', () => {
    mocks.instrumentInfo.data = [
      scalarFixture({ id: 'form-1', title: 'Happiness Questionnaire' }),
      scalarFixture({ id: 'form-2', sourceRepo: { id: 'repo-2', name: 'Other Repo' }, title: 'Breakfast Survey' }),
      scalarFixture({ id: 'form-3', sourceRepo: null, title: 'Manual Upload' })
    ];
    renderPage();
    fireEvent.click(rowAction('View'));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('Happiness Questionnaire')).toBeTruthy();
    expect(dialog.queryByText('Breakfast Survey')).toBeNull();
    expect(dialog.queryByText('Manual Upload')).toBeNull();
  });

  it('should show the edition of a scalar instrument and a dash for a series, which has none', () => {
    mocks.instrumentInfo.data = [
      scalarFixture({ edition: 3, id: 'form-1', title: 'Happiness Questionnaire' }),
      seriesFixture({ id: 'series-1', title: 'Baseline Battery' })
    ];
    renderPage();
    fireEvent.click(rowAction('View'));
    const editions = within(screen.getByRole('dialog'))
      .getAllByRole('listitem')
      .map((item) => item.querySelectorAll('p')[2]!.textContent);
    expect(editions).toEqual(['3', '-']);
  });

  it('should list only the latest edition of an instrument the repository has bumped', () => {
    mocks.instrumentInfo.data = [
      scalarFixture({ edition: 4, id: 'form-1', internalName: 'GI', title: 'General Information' }),
      scalarFixture({ edition: 5, id: 'form-2', internalName: 'GI', title: 'General Information' })
    ];
    renderPage();
    fireEvent.click(rowAction('View'));
    const editions = within(screen.getByRole('dialog'))
      .getAllByRole('listitem')
      .map((item) => item.querySelectorAll('p')[2]!.textContent);
    expect(editions).toEqual(['5']);
  });

  // The API orders by nothing this page controls, so the newest edition may arrive first.
  it('should keep the latest edition even when it comes before the superseded one in the data', () => {
    mocks.instrumentInfo.data = [
      scalarFixture({ edition: 5, id: 'form-2', internalName: 'GI', title: 'General Information' }),
      scalarFixture({ edition: 4, id: 'form-1', internalName: 'GI', title: 'General Information' })
    ];
    renderPage();
    fireEvent.click(rowAction('View'));
    const editions = within(screen.getByRole('dialog'))
      .getAllByRole('listitem')
      .map((item) => item.querySelectorAll('p')[2]!.textContent);
    expect(editions).toEqual(['5']);
  });

  it('should count only the latest edition of each instrument once the instrument info has loaded', () => {
    mocks.instrumentInfo.data = [
      scalarFixture({ edition: 4, id: 'form-1', internalName: 'GI', title: 'General Information' }),
      scalarFixture({ edition: 5, id: 'form-2', internalName: 'GI', title: 'General Information' }),
      seriesFixture({ id: 'series-1', title: 'Baseline Battery' })
    ];
    renderPage([repoFixture({ instrumentIds: ['form-1', 'form-2', 'series-1'] })]);
    expect(within(rows()[0]!).getByText('2')).toBeTruthy();
  });

  it('should link to the repository source in the view dialog, so it can be opened on GitHub', () => {
    renderPage();
    fireEvent.click(rowAction('View'));
    const link = screen.getByTestId<HTMLAnchorElement>('instrument-repo-source-link');
    expect(link.href).toBe('https://github.com/douglasneuroinformatics/core');
    expect(link.target).toBe('_blank');
  });

  it('should filter the view dialog by instrument title', async () => {
    mocks.instrumentInfo = {
      data: [
        scalarFixture({ id: 'form-1', title: 'Happiness Scale' }),
        scalarFixture({ id: 'form-2', title: 'Sleep Diary' })
      ],
      isLoading: false
    };
    renderPage();
    fireEvent.click(rowAction('View'));
    fireEvent.change(screen.getByPlaceholderText('Search instruments...'), { target: { value: 'sleep' } });
    expect(screen.getByText('Sleep Diary')).toBeTruthy();
    // The list animates an instrument out, so it leaves the DOM once its exit transition ends.
    await waitFor(() => expect(screen.queryByText('Happiness Scale')).toBeNull());
  });

  it('should say when no instrument matches the search, rather than that the repository is empty', () => {
    mocks.instrumentInfo = { data: [scalarFixture({ id: 'form-1', title: 'Happiness Scale' })], isLoading: false };
    renderPage();
    fireEvent.click(rowAction('View'));
    fireEvent.change(screen.getByPlaceholderText('Search instruments...'), { target: { value: 'nothing' } });
    expect(screen.getByText('No instruments match your search.')).toBeTruthy();
  });

  it('should close the view dialog when it is dismissed', () => {
    renderPage();
    fireEvent.click(rowAction('View'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByText('Instruments in "Core Repo"')).toBeNull();
  });

  it('should refuse to delete a repository a group still uses, warning instead of asking for confirmation', () => {
    mocks.groups = [groupFixture(['repo-1'])];
    renderPage();
    fireEvent.click(rowAction('Delete'));
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
    expect(useNotificationsStore.getState().notifications).toMatchObject([
      {
        message: '"Core Repo" is assigned to one or more groups. Remove it from those groups before deleting.',
        type: 'warning'
      }
    ]);
  });

  it('should ask for confirmation before deleting a repository no group uses', () => {
    mocks.groups = [groupFixture(['repo-2'])];
    renderPage();
    fireEvent.click(rowAction('Delete'));
    expect(screen.getByText('Are you absolutely sure?')).toBeTruthy();
    expect(mocks.deleteRepo).not.toHaveBeenCalled();
  });

  it('should delete the repository and close the confirmation once it is accepted', () => {
    renderPage();
    fireEvent.click(rowAction('Delete'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mocks.deleteRepo).toHaveBeenCalledWith({ id: 'repo-1' });
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
  });

  it('should close the confirmation without deleting when it is declined', () => {
    renderPage();
    fireEvent.click(rowAction('Delete'));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
    expect(mocks.deleteRepo).not.toHaveBeenCalled();
  });
});
