import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { USERS_QUERY_KEY, usersQueryOptions, useUsersQuery } from '../useUsersQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const user = {
  additionalPermissions: [],
  archivedAt: '2026-03-01T00:00:00.000Z',
  basePermissionLevel: 'STANDARD',
  createdAt: '2026-01-01T00:00:00.000Z',
  firstName: 'Jane',
  groupIds: ['group-1'],
  id: 'user-1',
  lastName: 'Doe',
  updatedAt: '2026-01-02T00:00:00.000Z',
  username: 'jdoe'
};

function renderUsersQuery(...args: Parameters<typeof useUsersQuery>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return renderHook(() => useUsersQuery(...args), { wrapper });
}

describe('useUsersQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [user] });
  });

  it('should forward the group to the users endpoint, so a manager sees only their group', async () => {
    const { result } = renderUsersQuery({ params: { groupId: 'group-1' } });
    await waitFor(() => expect(result.current?.data).toHaveLength(1));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/users', { params: { groupId: 'group-1' } });
  });

  it('should parse the archive date into a date, so the table can tell archived users apart', async () => {
    const { result } = renderUsersQuery();
    await waitFor(() => expect(result.current?.data).toHaveLength(1));
    expect(result.current.data[0]?.archivedAt).toStrictEqual(new Date('2026-03-01T00:00:00.000Z'));
  });

  it('should key every list under the users prefix, so one invalidation refreshes them all', () => {
    expect(usersQueryOptions({ params: { groupId: 'group-1' } }).queryKey).toStrictEqual([USERS_QUERY_KEY, 'group-1']);
    expect(usersQueryOptions().queryKey).toStrictEqual([USERS_QUERY_KEY, undefined]);
  });
});
