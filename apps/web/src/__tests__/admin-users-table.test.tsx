import type { PropsWithChildren } from 'react';

import type { User } from '@opendatacapture/schemas/user';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/users/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  archiveUser: vi.fn(),
  currentUser: null as null | { username: string },
  navigate: vi.fn(),
  unarchiveUser: vi.fn(),
  users: [] as User[],
  usersQueryOptions: vi.fn(() => ({ queryKey: ['users'] }))
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, to }: PropsWithChildren<{ to: string }>) => <a href={to}>{children}</a>,
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useUsersQuery', () => ({
  usersQueryOptions: mocks.usersQueryOptions,
  useUsersQuery: () => ({ data: mocks.users })
}));
vi.mock('@/hooks/useArchiveUserMutation', () => ({ useArchiveUserMutation: () => ({ mutate: mocks.archiveUser }) }));
vi.mock('@/hooks/useUnarchiveUserMutation', () => ({
  useUnarchiveUserMutation: () => ({ mutate: mocks.unarchiveUser })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentUser: null | { username: string } }) => unknown) =>
    selector({ currentUser: mocks.currentUser })
}));

const userFixture = (overrides: Partial<User> = {}): User => ({
  additionalPermissions: [],
  basePermissionLevel: 'STANDARD',
  createdAt: new Date('2026-01-01'),
  firstName: 'Jane',
  groupIds: [],
  id: 'user-1',
  lastName: 'Doe',
  updatedAt: new Date('2026-10-01'),
  username: 'jane',
  ...overrides
});

const renderTable = (users: User[]) => {
  mocks.users = users;
  const Component = Route.options.component!;
  render(<Component />);
};

const rows = () => screen.getAllByTestId('data-table-row');

const usernames = () => rows().map((row) => row.querySelector('[data-row-selected]')!.parentElement!.textContent);

const header = (label: string) =>
  within(screen.getByTestId('data-table-head')).getByText(label, { selector: 'button' });

const openRowActions = (rowIndex = 0) => {
  fireEvent.keyDown(within(rows()[rowIndex]!).getByTestId('row-actions-trigger'), { key: 'Enter' });
  return screen.getByTestId('row-actions-dropdown');
};

const rowAction = (label: string, rowIndex = 0) =>
  within(openRowActions(rowIndex)).getByRole('menuitem', { name: label });

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

/** Gives the closing dialog an exit animation, so Radix keeps it mounted after its state clears. */
const animateDialogExit = () => {
  const style = document.createElement('style');
  style.textContent = '[role="dialog"][data-state="closed"] { animation-name: exit; }';
  document.head.append(style);
  onTestFinished(() => style.remove());
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.archiveUser.mockReset();
  mocks.currentUser = null;
});

afterEach(cleanup);

describe('admin users table', () => {
  it.each([false, true, null, undefined])('should display disabled=%s independently of archive status', (disabled) => {
    renderTable([userFixture({ archivedAt: new Date('2026-10-01'), disabled })]);
    expect(screen.getByTestId('user-login-status').textContent).toBe(disabled ? 'Disabled' : 'Enabled');
    expect(screen.getByTestId('user-status-archived')).toBeTruthy();
    const headers = within(screen.getByTestId('data-table-head'))
      .getAllByRole('button', { hidden: true })
      .map((header) => header.textContent)
      .filter(Boolean);
    expect(headers.indexOf('Enabled / Disabled')).toBe(headers.indexOf('Status') - 1);
  });

  it('should prefetch the users list in the loader, so the table renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue([]);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['users'] });
  });

  it('should mark a user who is not archived as active', () => {
    renderTable([userFixture()]);
    expect(screen.getByTestId('user-status-active').textContent).toBe('Active');
  });

  it('should show the date a user was archived on', () => {
    renderTable([userFixture({ archivedAt: new Date('2026-10-01T00:00:00Z') })]);
    expect(screen.getByTestId('user-status-archived').textContent).toBe('Archived on 2026-10-01');
  });

  it('should label a user without a base permission level as having none', () => {
    renderTable([userFixture({ basePermissionLevel: null })]);
    expect(within(rows()[0]!).getByText('None')).toBeTruthy();
  });

  it('should translate a base permission level into its display name', () => {
    renderTable([userFixture({ basePermissionLevel: 'GROUP_MANAGER' })]);
    expect(within(rows()[0]!).getByText('Group Manager')).toBeTruthy();
  });

  it('should sort by a column ascending, then descending, as its header is clicked', () => {
    renderTable([userFixture({ id: 'b', username: 'bob' }), userFixture({ id: 'a', username: 'alice' })]);
    fireEvent.click(header('Username'));
    expect(usernames()).toEqual(['alice', 'bob']);
    fireEvent.click(header('Username'));
    expect(usernames()).toEqual(['bob', 'alice']);
  });

  it('should list disabled accounts first on the first sort by login status', () => {
    renderTable([
      userFixture({ disabled: false, id: 'a', username: 'alice' }),
      userFixture({ disabled: true, id: 'b', username: 'bob' })
    ]);
    fireEvent.click(header('Enabled / Disabled'));
    expect(usernames()).toEqual(['bob', 'alice']);
  });

  it('should highlight the row that was clicked', () => {
    renderTable([userFixture()]);
    fireEvent.click(rows()[0]!);
    expect(rows()[0]!.querySelector('[data-row-selected]')!.getAttribute('data-row-selected')).toBe('true');
  });

  it('should open the user page on a double click', () => {
    renderTable([userFixture()]);
    fireEvent.doubleClick(rows()[0]!);
    expect(mocks.navigate).toHaveBeenCalledWith({ params: { userId: 'user-1' }, to: '/admin/users/$userId' });
  });

  it('should open the user page from the manage action', () => {
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Manage'));
    expect(mocks.navigate).toHaveBeenCalledWith({ params: { userId: 'user-1' }, to: '/admin/users/$userId' });
  });

  it('should link to the page for adding a user', () => {
    renderTable([userFixture()]);
    expect(screen.getByRole('link', { name: 'Add User' }).getAttribute('href')).toBe('/admin/users/create');
  });

  it('should not let an administrator archive their own account', () => {
    mocks.currentUser = { username: 'jane' };
    renderTable([userFixture()]);
    expect(rowAction('Archive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should not offer to archive a user who is already archived', () => {
    renderTable([userFixture({ archivedAt: new Date('2026-10-01') })]);
    expect(rowAction('Archive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should not offer to unarchive a user who is not archived', () => {
    renderTable([userFixture()]);
    expect(rowAction('Unarchive').hasAttribute('data-disabled')).toBe(true);
  });

  it('should unarchive a user straight from the row action, since it is not destructive', () => {
    renderTable([userFixture({ archivedAt: new Date('2026-10-01') })]);
    fireEvent.click(rowAction('Unarchive'));
    expect(mocks.unarchiveUser).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('should ask for confirmation before archiving a user', () => {
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    expect(screen.getByText('Are you absolutely sure?')).toBeTruthy();
    expect(mocks.archiveUser).not.toHaveBeenCalled();
  });

  it('should archive the user once the confirmation is accepted', () => {
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByTestId('confirm-archive-user'));
    expect(mocks.archiveUser).toHaveBeenCalledWith({ id: 'user-1' }, expect.anything());
  });

  it('should close the confirmation once the archive succeeds', () => {
    mocks.archiveUser.mockImplementation((_: unknown, options: { onSuccess: () => void }) => options.onSuccess());
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByTestId('confirm-archive-user'));
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
  });

  it('should ignore a confirmation clicked while the dialog is closing, since the user is already archived', () => {
    animateDialogExit();
    mocks.archiveUser.mockImplementation((_: unknown, options: { onSuccess: () => void }) => options.onSuccess());
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByTestId('confirm-archive-user'));
    fireEvent.click(screen.getByTestId('confirm-archive-user'));
    expect(mocks.archiveUser).toHaveBeenCalledTimes(1);
  });

  it('should close the confirmation without archiving when it is declined', () => {
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
    expect(mocks.archiveUser).not.toHaveBeenCalled();
  });

  it('should close the confirmation without archiving when it is dismissed', () => {
    renderTable([userFixture()]);
    fireEvent.click(rowAction('Archive'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
    expect(mocks.archiveUser).not.toHaveBeenCalled();
  });
});
