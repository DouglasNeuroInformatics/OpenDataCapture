import type { PropsWithChildren } from 'react';

import type { User } from '@opendatacapture/schemas/user';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/users/index';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({ users: [] as User[] }));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children }: PropsWithChildren) => <span>{children}</span>,
  useNavigate: () => vi.fn()
}));
vi.mock('@/hooks/useUsersQuery', () => ({
  usersQueryOptions: vi.fn(),
  useUsersQuery: () => ({ data: mocks.users })
}));
vi.mock('@/hooks/useArchiveUserMutation', () => ({ useArchiveUserMutation: () => ({ mutate: vi.fn() }) }));
vi.mock('@/hooks/useUnarchiveUserMutation', () => ({ useUnarchiveUserMutation: () => ({ mutate: vi.fn() }) }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentUser: null }) => unknown) => selector({ currentUser: null })
}));

afterEach(cleanup);

describe('admin users table', () => {
  it.each([false, true, null, undefined])('should display disabled=%s independently of archive status', (disabled) => {
    mocks.users = [
      {
        additionalPermissions: [],
        archivedAt: new Date('2026-10-01'),
        basePermissionLevel: 'STANDARD',
        createdAt: new Date('2026-01-01'),
        disabled,
        firstName: 'Jane',
        groupIds: [],
        id: 'user-1',
        lastName: 'Doe',
        updatedAt: new Date('2026-10-01'),
        username: 'jane'
      }
    ];
    const Component = Route.options.component!;
    render(<Component />);
    expect(screen.getByTestId('user-login-status').textContent).toBe(disabled ? 'Disabled' : 'Enabled');
    expect(screen.getByTestId('user-status-archived')).toBeTruthy();
    const headers = within(screen.getByTestId('data-table-head'))
      .getAllByRole('button', { hidden: true })
      .map((header) => header.textContent)
      .filter(Boolean);
    expect(headers.indexOf('Enabled / Disabled')).toBe(headers.indexOf('Status') - 1);
  });
});
