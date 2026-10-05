import type { PropsWithChildren } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Group } from '@opendatacapture/schemas/group';
import type { InstrumentRepo } from '@opendatacapture/schemas/instrument-repo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GROUPS_QUERY_KEY, groupsQueryOptions } from '@/hooks/useGroupsQuery';
import { INSTRUMENT_REPOS_QUERY_KEY, instrumentReposQueryOptions } from '@/hooks/useInstrumentReposQuery';
import { Route } from '@/routes/_app/admin/groups/index';

import '@/services/i18n';

/** A group as the table receives it, with `type` widened so a value the client does not know can be rendered. */
type GroupRow = Omit<Group, 'type'> & { type: string };

const mocks = vi.hoisted(() => ({
  deleteGroup: vi.fn(),
  groups: [] as GroupRow[],
  patch: vi.fn(),
  repos: [] as InstrumentRepo[]
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { isAxiosError: actual.isAxiosError, patch: mocks.patch } };
});
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, to }: PropsWithChildren<{ to: string }>) => <a href={to}>{children}</a>
}));
vi.mock('@/hooks/useDeleteGroupMutation', () => ({
  useDeleteGroupMutation: () => ({ mutate: mocks.deleteGroup })
}));
vi.mock('@/hooks/useGroupsQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useGroupsQuery')>()),
  useGroupsQuery: () => ({ data: mocks.groups })
}));
vi.mock('@/hooks/useInstrumentReposQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useInstrumentReposQuery')>()),
  useInstrumentReposQuery: () => ({ data: mocks.repos })
}));

const groupFixture = (overrides: Partial<GroupRow> = {}): GroupRow => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Depression Clinic',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', subjectIdDisplayLength: null },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: [],
  ...overrides
});

const repoFixture = (overrides: Partial<InstrumentRepo> = {}): InstrumentRepo => ({
  createdAt: new Date('2026-01-01'),
  groupIds: [],
  id: 'repo-1',
  instrumentIds: ['instrument-1', 'instrument-2'],
  name: 'Core Instruments',
  owner: 'DouglasNeuroinformatics',
  repoName: 'core-instruments',
  updatedAt: new Date('2026-01-02'),
  url: 'https://github.com/DouglasNeuroinformatics/core-instruments',
  ...overrides
});

const serverError = (data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status: 400,
    statusText: 'Bad Request'
  });

const renderPage = (queryClient = new QueryClient()) => {
  const Component = Route.options.component!;
  render(
    <QueryClientProvider client={queryClient}>
      <Component />
    </QueryClientProvider>
  );
  return queryClient;
};

const rows = () => screen.getAllByTestId('data-table-row');

const openSheet = (rowIndex = 0) => {
  fireEvent.doubleClick(rows()[rowIndex]!);
  return screen.getByRole('dialog');
};

const repoCheckbox = (name: string) => {
  const repoRow = screen.getByText(name).closest<HTMLElement>('div.rounded-md')!;
  return within(repoRow).getByRole('checkbox');
};

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save' }));

const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);

/** Gives the closing sheet an exit animation, so Radix keeps it mounted after the selection clears. */
const animateSheetExit = () => {
  const style = document.createElement('style');
  style.textContent = '[role="dialog"][data-state="closed"] { animation-name: exit; }';
  document.head.append(style);
  return () => style.remove();
};

beforeEach(() => {
  vi.clearAllMocks();
  useNotificationsStore.setState({ notifications: [] });
  mocks.groups = [groupFixture()];
  mocks.repos = [];
  mocks.patch.mockImplementation((_url: string, body: { instrumentRepoIds: string[] }) =>
    Promise.resolve({ data: { ...groupFixture(), instrumentRepoIds: body.instrumentRepoIds } })
  );
});

afterEach(cleanup);

describe('admin groups route', () => {
  it('should prefetch the groups and the instrument repositories, so the sheet never suspends', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    const { loader } = Route.options;
    if (typeof loader !== 'function') {
      throw new Error('Expected the route to define its loader as a function');
    }
    await loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
    expect(ensureQueryData.mock.calls.map(([options]) => options.queryKey)).toEqual([
      groupsQueryOptions().queryKey,
      instrumentReposQueryOptions().queryKey
    ]);
  });

  it.each([
    ['CLINICAL', 'Clinical'],
    ['RESEARCH', 'Research']
  ])('should translate the %s group type into its display name', (type, label) => {
    mocks.groups = [groupFixture({ type })];
    renderPage();
    expect(within(rows()[0]!).getByText(label)).toBeTruthy();
  });

  it('should show a group type the client does not know verbatim rather than hide it', () => {
    mocks.groups = [groupFixture({ type: 'COMMUNITY' })];
    renderPage();
    expect(within(rows()[0]!).getByText('COMMUNITY')).toBeTruthy();
  });

  it('should highlight only the row that was clicked', () => {
    mocks.groups = [groupFixture(), groupFixture({ id: 'group-2', name: 'Psychosis Lab' })];
    renderPage();
    fireEvent.click(rows()[1]!);
    const selected = rows().map((row) => row.querySelector('[data-row-selected]')!.getAttribute('data-row-selected'));
    expect(selected).toEqual(['false', 'true']);
  });

  it('should link to the page for adding a group', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Add Group' }).getAttribute('href')).toBe('/admin/groups/create');
  });

  it('should open the group sheet on a double click', () => {
    renderPage();
    expect(within(openSheet()).getByText('Depression Clinic')).toBeTruthy();
  });

  it('should open the group sheet from the manage action', () => {
    renderPage();
    fireEvent.keyDown(within(rows()[0]!).getByTestId('row-actions-trigger'), { key: 'Enter' });
    fireEvent.click(within(screen.getByTestId('row-actions-dropdown')).getByRole('menuitem', { name: 'Manage' }));
    expect(within(screen.getByRole('dialog')).getByText('Depression Clinic')).toBeTruthy();
  });

  it('should explain how to add a repository when none exist', () => {
    renderPage();
    openSheet();
    expect(screen.getByText('No instrument repositories available. Add one from the admin menu.')).toBeTruthy();
  });

  it('should list each repository with the number of instruments it provides', () => {
    mocks.repos = [repoFixture()];
    renderPage();
    const sheet = openSheet();
    expect(within(sheet).getByText('Core Instruments').nextElementSibling!.textContent).toBe('(2 instruments)');
  });

  it('should check the repositories the group already has access to', () => {
    mocks.groups = [groupFixture({ instrumentRepoIds: ['repo-2'] })];
    mocks.repos = [repoFixture(), repoFixture({ id: 'repo-2', name: 'Extra Instruments' })];
    renderPage();
    openSheet();
    expect(repoCheckbox('Core Instruments').getAttribute('aria-checked')).toBe('false');
    expect(repoCheckbox('Extra Instruments').getAttribute('aria-checked')).toBe('true');
  });

  it('should save a newly checked repository alongside the ones already granted', async () => {
    mocks.groups = [groupFixture({ instrumentRepoIds: ['repo-2'] })];
    mocks.repos = [repoFixture(), repoFixture({ id: 'repo-2', name: 'Extra Instruments' })];
    renderPage();
    openSheet();
    fireEvent.click(repoCheckbox('Core Instruments'));
    save();
    await waitFor(() =>
      expect(mocks.patch).toHaveBeenCalledWith(
        '/v1/groups/group-1',
        { instrumentRepoIds: ['repo-2', 'repo-1'] },
        { meta: { disableDefaultErrorNotification: true } }
      )
    );
  });

  it('should revoke a repository that is unchecked before saving', async () => {
    mocks.groups = [groupFixture({ instrumentRepoIds: ['repo-1'] })];
    mocks.repos = [repoFixture()];
    renderPage();
    openSheet();
    fireEvent.click(repoCheckbox('Core Instruments'));
    save();
    await waitFor(() =>
      expect(mocks.patch).toHaveBeenCalledWith('/v1/groups/group-1', { instrumentRepoIds: [] }, expect.anything())
    );
  });

  it('should close the sheet and confirm success once the repositories are saved', async () => {
    renderPage();
    openSheet();
    save();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(lastNotification()).toMatchObject({ type: 'success' });
  });

  it('should refetch the groups and repositories after a save, since both record the assignment', async () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    renderPage(queryClient);
    openSheet();
    save();
    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledTimes(2));
    expect(invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      [GROUPS_QUERY_KEY],
      [INSTRUMENT_REPOS_QUERY_KEY]
    ]);
  });

  it('should show the server message and keep the sheet open when a save fails', async () => {
    mocks.patch.mockRejectedValue(serverError({ message: 'Repository is archived' }));
    renderPage();
    openSheet();
    save();
    await waitFor(() => expect(lastNotification()).toMatchObject({ message: 'Repository is archived', type: 'error' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should fall back to a generic message when a failed save carries none', async () => {
    mocks.patch.mockRejectedValue(new Error('Network down'));
    renderPage();
    openSheet();
    save();
    await waitFor(() =>
      expect(lastNotification()).toMatchObject({ message: 'Failed to update group repositories', type: 'error' })
    );
  });

  it('should ask for confirmation before deleting a group', () => {
    renderPage();
    openSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Are you absolutely sure?')).toBeTruthy();
    expect(mocks.deleteGroup).not.toHaveBeenCalled();
  });

  it('should delete the group and close the sheet once the deletion is confirmed', async () => {
    renderPage();
    openSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mocks.deleteGroup).toHaveBeenCalledWith({ id: 'group-1' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('should keep the group and return to the sheet when the deletion is declined', async () => {
    renderPage();
    openSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    await waitFor(() => expect(screen.queryByText('Are you absolutely sure?')).toBeNull());
    expect(mocks.deleteGroup).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should close the sheet when it is dismissed', async () => {
    renderPage();
    fireEvent.keyDown(openSheet(), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('should ignore a save from a sheet that is already closing, rather than crash on the cleared selection', () => {
    const removeStyle = animateSheetExit();
    const uncaughtErrors: unknown[] = [];
    const collectError = (event: ErrorEvent) => uncaughtErrors.push(event.error);
    window.addEventListener('error', collectError);
    try {
      renderPage();
      fireEvent.keyDown(openSheet(), { key: 'Escape' });
      save();
      expect(uncaughtErrors).toEqual([]);
      expect(mocks.patch).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('error', collectError);
      removeStyle();
    }
  });
});
