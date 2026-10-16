import type { FC } from 'react';

import type { DataTableProps } from '@douglasneuroinformatics/libui/components';
import type { $AuditLog, $AuditLogsPage, $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { auditLogsQueryOptions } from '@/hooks/useAuditLogsQuery';
import { groupsQueryOptions } from '@/hooks/useGroupsQuery';
import { usersQueryOptions } from '@/hooks/useUsersQuery';

import '@/routes/_app/admin/audit/logs';
import '@/services/i18n';

type AuditLogsSearch = $AuditLogsQuerySearchParams;

type QueryOptions = { queryKey: readonly unknown[] };

/** The parts of the route options under test, typed by what this file passes to them. */
type CapturedRouteOptions = {
  component: FC;
  loader: (ctx: {
    context: { queryClient: { ensureQueryData: (options: QueryOptions) => Promise<unknown> } };
    deps: { search: AuditLogsSearch };
  }) => Promise<void>;
  loaderDeps: (ctx: { search: AuditLogsSearch }) => { search: AuditLogsSearch };
  validateSearch: { safeParse: (input: unknown) => { success: boolean } };
};

type NavigateOptions = { search: ((current: AuditLogsSearch) => AuditLogsSearch) | AuditLogsSearch; to: string };

type SortingState = { desc: boolean; id: string }[];

const mocks = vi.hoisted(() => ({
  auditLogsPage: undefined as $AuditLogsPage | undefined,
  download: vi.fn<(filename: string, data: () => Promise<string>) => Promise<void>>(),
  fetchAllAuditLogs: vi.fn<(search: AuditLogsSearch) => Promise<$AuditLog[]>>(),
  groups: [] as Group[],
  navigate: vi.fn<(options: NavigateOptions) => Promise<void>>(),
  queryAuditLogs: vi.fn<(options: { params: object }) => void>(),
  reportSorting: undefined as ((state: SortingState) => void) | undefined,
  route: {} as CapturedRouteOptions,
  search: {},
  users: [] as User[]
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: CapturedRouteOptions) => {
    mocks.route = options;
    return { options, useNavigate: () => mocks.navigate, useSearch: () => mocks.search };
  }
}));
vi.mock('@douglasneuroinformatics/libui/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@douglasneuroinformatics/libui/components')>();
  return {
    ...actual,
    DataTable: (props: DataTableProps) => {
      if (props.mode === 'server') {
        mocks.reportSorting = props.onSortingChange;
      }
      return <actual.DataTable {...props} />;
    }
  };
});
vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download
}));
vi.mock('@/hooks/useAuditLogsQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useAuditLogsQuery')>()),
  fetchAllAuditLogs: mocks.fetchAllAuditLogs,
  useAuditLogsQuery: (options: { params: object }) => {
    mocks.queryAuditLogs(options);
    return { data: mocks.auditLogsPage };
  }
}));
vi.mock('@/hooks/useGroupsQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useGroupsQuery')>()),
  useGroupsQuery: () => ({ data: mocks.groups })
}));
vi.mock('@/hooks/useUsersQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useUsersQuery')>()),
  useUsersQuery: () => ({ data: mocks.users })
}));

const TIMESTAMP = Date.UTC(2026, 9, 4, 14, 30, 15);

const groupFixture = (id: string, name: string): Group => ({
  accessibleInstrumentIds: [],
  createdAt: new Date('2026-01-01'),
  id,
  instrumentRepoIds: [],
  name,
  settings: { defaultIdentificationMethod: 'CUSTOM_ID', subjectIdDisplayLength: null },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: new Date('2026-01-02'),
  userIds: []
});

const userFixture = (id: string, username: string, groupIds: string[]): User => ({
  additionalPermissions: [],
  basePermissionLevel: 'STANDARD',
  createdAt: new Date('2026-01-01'),
  firstName: 'Jane',
  groupIds,
  id,
  lastName: 'Doe',
  updatedAt: new Date('2026-01-02'),
  username
});

const logFixture = (overrides: Partial<$AuditLog> = {}): $AuditLog => ({
  action: 'SEND_EMAIL',
  entity: 'INSTRUMENT_RECORD',
  group: { name: 'Depression Clinic' },
  id: 'log-1',
  timestamp: TIMESTAMP,
  user: { username: 'jane' },
  ...overrides
});

const AuditLogsPage = mocks.route.component;

const renderPage = () => render(<AuditLogsPage />);

const rows = () => screen.getAllByTestId('data-table-row');

const cellTexts = (rowIndex = 0) => Array.from(rows()[rowIndex]!.children, (cell) => cell.textContent);

const lastQueryParams = () => mocks.queryAuditLogs.mock.lastCall?.[0].params;

const openFilter = (testId: string) => {
  fireEvent.keyDown(screen.getByTestId(testId), { key: 'Enter' });
  return screen.getByRole('menu');
};

const chooseFilter = (testId: string, label: string) => {
  fireEvent.click(within(openFilter(testId)).getByRole('menuitemradio', { name: label }));
};

const filterOptions = (testId: string) =>
  within(openFilter(testId))
    .getAllByRole('menuitemradio')
    .map((item) => item.textContent);

/** The search the last navigation produces from the current one. */
const navigatedSearch = (current: AuditLogsSearch = mocks.search) => {
  const { search } = mocks.navigate.mock.lastCall![0];
  return typeof search === 'function' ? search(current) : search;
};

const timeHeaderButton = () => within(screen.getByTestId('data-table-head')).getByText('Time', { selector: 'button' });

const goToPage = (page: number) => {
  screen
    .getAllByRole('button', { hidden: true })
    .filter((button) => button.textContent === String(page))
    .forEach((button) => fireEvent.click(button));
};

const runLoader = (search: AuditLogsSearch) => {
  const ensureQueryData = vi.fn((_options: QueryOptions) => Promise.resolve());
  const { search: depsSearch } = mocks.route.loaderDeps({ search });
  return {
    ensureQueryData,
    promise: mocks.route.loader({ context: { queryClient: { ensureQueryData } }, deps: { search: depsSearch } })
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auditLogsPage = { data: [logFixture()], pageCount: 3, total: 3 };
  mocks.groups = [groupFixture('group-1', 'Depression Clinic'), groupFixture('group-2', 'Psychosis Lab')];
  mocks.users = [userFixture('user-1', 'jane', ['group-1']), userFixture('user-2', 'john', ['group-2'])];
  mocks.search = {};
  mocks.navigate.mockResolvedValue(undefined);
  mocks.download.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('audit logs route', () => {
  it('should prefetch the filtered logs, the groups and the users, keyed on the search', async () => {
    const search: AuditLogsSearch = { action: 'LOGIN', groupId: 'group-1' };
    const { ensureQueryData, promise } = runLoader(search);
    await promise;
    expect(ensureQueryData.mock.calls.map(([options]) => options.queryKey)).toEqual([
      auditLogsQueryOptions({ params: search }).queryKey,
      groupsQueryOptions().queryKey,
      usersQueryOptions().queryKey
    ]);
  });

  it('should reject a search naming an action that does not exist', () => {
    expect(mocks.route.validateSearch.safeParse({ action: 'TELEPORT' }).success).toBe(false);
  });

  it('should title the page as the audit logs', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: 'Audit Logs' })).toBeTruthy();
  });
});

describe('audit logs toolbar', () => {
  it('should offer every group as a filter', () => {
    renderPage();
    expect(filterOptions('audit-logs-filter-group')).toEqual(['All Groups', 'Depression Clinic', 'Psychosis Lab']);
  });

  it('should filter by the chosen group', () => {
    renderPage();
    chooseFilter('audit-logs-filter-group', 'Psychosis Lab');
    expect(navigatedSearch()).toEqual({ groupId: 'group-2', userId: undefined });
  });

  it('should keep the user filter when the chosen group contains that user', () => {
    mocks.search = { userId: 'user-1' };
    renderPage();
    chooseFilter('audit-logs-filter-group', 'Depression Clinic');
    expect(navigatedSearch()).toEqual({ groupId: 'group-1', userId: 'user-1' });
  });

  it('should drop the user filter when the chosen group does not contain that user', () => {
    mocks.search = { userId: 'user-1' };
    renderPage();
    chooseFilter('audit-logs-filter-group', 'Psychosis Lab');
    expect(navigatedSearch()).toEqual({ groupId: 'group-2', userId: undefined });
  });

  it('should keep the user filter when the group filter is cleared', () => {
    mocks.search = { groupId: 'group-1', userId: 'user-1' };
    renderPage();
    chooseFilter('audit-logs-filter-group', 'All Groups');
    expect(navigatedSearch()).toEqual({ groupId: undefined, userId: 'user-1' });
  });

  it('should offer every user while no group is chosen', () => {
    renderPage();
    expect(filterOptions('audit-logs-filter-user')).toEqual(['All Users', 'jane', 'john']);
  });

  it('should offer only the members of the chosen group as users', () => {
    mocks.search = { groupId: 'group-2' };
    renderPage();
    expect(filterOptions('audit-logs-filter-user')).toEqual(['All Users', 'john']);
  });

  it('should filter by the chosen user while keeping the other filters', () => {
    mocks.search = { action: 'LOGIN' };
    renderPage();
    chooseFilter('audit-logs-filter-user', 'john');
    expect(navigatedSearch()).toEqual({ action: 'LOGIN', userId: 'user-2' });
  });

  it('should offer every action under its translated name', () => {
    renderPage();
    expect(filterOptions('audit-logs-filter-action')).toEqual([
      'Any Action',
      'Create',
      'Delete',
      'Update',
      'Archive',
      'Unarchive',
      'Login',
      'Send Email'
    ]);
  });

  it('should filter by the chosen action', () => {
    renderPage();
    chooseFilter('audit-logs-filter-action', 'Send Email');
    expect(navigatedSearch()).toEqual({ action: 'SEND_EMAIL' });
  });

  it('should filter by the chosen entity', () => {
    renderPage();
    chooseFilter('audit-logs-filter-entity', 'Instrument Record');
    expect(navigatedSearch()).toEqual({ entity: 'INSTRUMENT_RECORD' });
  });

  it('should hide the clear filters button while no filter is set', () => {
    mocks.search = { groupId: undefined };
    renderPage();
    expect(screen.queryByTestId('audit-logs-clear-filters')).toBeNull();
  });

  it('should clear every filter at once', () => {
    mocks.search = { action: 'LOGIN', groupId: 'group-1' };
    renderPage();
    fireEvent.click(screen.getByTestId('audit-logs-clear-filters'));
    expect(mocks.navigate).toHaveBeenCalledWith({ search: {}, to: '.' });
  });

  it('should name the download after the moment it was requested', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_790_000_000_000);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(mocks.download).toHaveBeenCalledWith('ODC_Audit_Logs_1790000000000.json', expect.any(Function));
  });

  it('should download every log matching the filters, not just the page on screen', async () => {
    mocks.search = { entity: 'USER' };
    mocks.fetchAllAuditLogs.mockResolvedValue([logFixture(), logFixture({ id: 'log-2' })]);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    const [, data] = mocks.download.mock.lastCall!;
    expect(await data()).toBe(JSON.stringify([logFixture(), logFixture({ id: 'log-2' })], null, 2));
    expect(mocks.fetchAllAuditLogs).toHaveBeenCalledWith({ entity: 'USER' });
  });
});

describe('audit logs table', () => {
  it('should request the first page newest first, with the active filters', () => {
    mocks.search = { userId: 'user-1' };
    renderPage();
    expect(lastQueryParams()).toEqual({ page: 1, sortOrder: 'desc', userId: 'user-1' });
  });

  it('should show who acted, in which group, and the translated action and entity', () => {
    renderPage();
    expect(cellTexts().slice(1)).toEqual(['jane', 'Depression Clinic', 'Send Email', 'Instrument Record']);
  });

  it('should show N/A for a log with no user or group', () => {
    mocks.auditLogsPage = { data: [logFixture({ group: null, user: null })], pageCount: 1, total: 1 };
    renderPage();
    expect(cellTexts().slice(1, 3)).toEqual(['N/A', 'N/A']);
  });

  it('should show every log of the page the server returned, without paginating them again', () => {
    const logs = Array.from({ length: 25 }, (_, index) => logFixture({ id: `log-${index}` }));
    mocks.auditLogsPage = { data: logs, pageCount: 500, total: 12500 };
    renderPage();
    expect(rows()).toHaveLength(25);
  });

  it('should build the page controls from the page count the server reports, not from the logs on screen', () => {
    renderPage();
    const pageLabels = screen.getAllByRole('button', { hidden: true }).map((button) => button.textContent);
    expect(pageLabels).toContain('3');
    expect(pageLabels).not.toContain('4');
  });

  it('should show an empty table until the first page arrives', () => {
    mocks.auditLogsPage = undefined;
    renderPage();
    expect(screen.queryAllByTestId('data-table-row')).toHaveLength(0);
    expect(screen.getByText('No Results')).toBeTruthy();
  });

  it('should show timestamps in the local format by default', () => {
    renderPage();
    const local = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'medium' }).format(TIMESTAMP);
    expect(cellTexts()[0]).toBe(local);
  });

  it('should show timestamps in ISO 8601 once that format is chosen', () => {
    renderPage();
    fireEvent.keyDown(screen.getByLabelText('Date Format'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'ISO 8601' }));
    expect(cellTexts()[0]).toBe('2026-10-04T14:30:15.000Z');
  });

  it('should check the date format in use when the menu is opened', () => {
    renderPage();
    fireEvent.keyDown(screen.getByLabelText('Date Format'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'ISO 8601' }));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryAllByRole('menuitemcheckbox')).toHaveLength(0);
    fireEvent.keyDown(screen.getByLabelText('Date Format'), { key: 'Enter' });
    const checked = screen.getAllByRole('menuitemcheckbox').map((item) => item.getAttribute('aria-checked'));
    expect(checked).toEqual(['false', 'true']);
  });

  it('should mark the time column as descending before the user sorts, matching the server order', () => {
    renderPage();
    expect(timeHeaderButton().querySelector('.lucide-arrow-down')).toBeTruthy();
  });

  it('should request the next page when the user pages forward', () => {
    renderPage();
    goToPage(2);
    expect(lastQueryParams()).toEqual({ page: 2, sortOrder: 'desc' });
  });

  it('should request oldest first from the first page when the time column is flipped', () => {
    renderPage();
    goToPage(2);
    fireEvent.click(timeHeaderButton());
    fireEvent.click(timeHeaderButton());
    expect(lastQueryParams()).toEqual({ page: 1, sortOrder: 'asc' });
    expect(timeHeaderButton().querySelector('.lucide-arrow-up')).toBeTruthy();
  });

  it('should ignore a sorting change that does not involve the time column', () => {
    renderPage();
    goToPage(2);
    act(() => mocks.reportSorting!([]));
    expect(lastQueryParams()).toEqual({ page: 2, sortOrder: 'desc' });
  });

  it('should return to the first page when the filters change', () => {
    const { rerender } = renderPage();
    goToPage(2);
    mocks.search = { action: 'LOGIN' };
    rerender(<AuditLogsPage />);
    expect(lastQueryParams()).toEqual({ action: 'LOGIN', page: 1, sortOrder: 'desc' });
  });
});
