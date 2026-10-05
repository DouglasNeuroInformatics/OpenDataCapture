import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Group } from '@opendatacapture/schemas/group';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { InstrumentRepo } from '@opendatacapture/schemas/instrument-repo';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/instrument-repos/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  createRepo: vi.fn(),
  deleteRepo: vi.fn(),
  groups: [] as Group[],
  groupsQueryOptions: vi.fn(() => ({ queryKey: ['groups'] })),
  instrumentInfo: { data: undefined as TranslatedInstrumentInfo[] | undefined, isLoading: false },
  instrumentReposQueryOptions: vi.fn(() => ({ queryKey: ['instrument-repos'] })),
  isCreatePending: false,
  repos: [] as InstrumentRepo[],
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
vi.mock('@/hooks/useCreateInstrumentRepoMutation', () => ({
  useCreateInstrumentRepoMutation: () => ({ isPending: mocks.isCreatePending, mutate: mocks.createRepo })
}));
vi.mock('@/hooks/useDeleteInstrumentRepoMutation', () => ({
  useDeleteInstrumentRepoMutation: () => ({ mutate: mocks.deleteRepo })
}));
vi.mock('@/hooks/useSyncInstrumentRepoMutation', () => ({
  useSyncInstrumentRepoMutation: () => ({ mutate: mocks.syncRepo })
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

const scalarFixture = ({
  edition = 1,
  id,
  sourceRepo = { id: 'repo-1', name: 'Core Repo' },
  title
}: {
  edition?: number;
  id: string;
  sourceRepo?: null | { id: string; name: null | string };
  title: string;
}): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  internal: { edition, name: id },
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

beforeEach(() => {
  vi.clearAllMocks();
  mocks.groups = [];
  mocks.instrumentInfo = { data: undefined, isLoading: false };
  mocks.isCreatePending = false;
  useNotificationsStore.setState({ notifications: [] });
});

afterEach(cleanup);

describe('admin instrument repositories page', () => {
  it('should prefetch the repositories and groups in the loader, so the page renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData.mock.calls).toEqual([[{ queryKey: ['instrument-repos'] }], [{ queryKey: ['groups'] }]]);
  });

  it('should count the instruments a repository contributed', () => {
    renderPage();
    expect(within(rows()[0]!).getByText('2')).toBeTruthy();
  });

  it('should show a dash for a repository that has never been synced', () => {
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
    mocks.createRepo.mockImplementation((_: unknown, options: { onSuccess: () => void }) => options.onSuccess());
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
