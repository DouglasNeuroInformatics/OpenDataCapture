import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFindUserQuery, useFindUserQueryOptions } from '../useFindUserQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const USER = {
  additionalPermissions: [],
  basePermissionLevel: 'STANDARD',
  createdAt: '2026-01-01T00:00:00.000Z',
  firstName: 'Ada',
  groupIds: ['group-1'],
  id: 'user-1',
  lastName: 'Lovelace',
  updatedAt: '2026-01-02T00:00:00.000Z',
  username: 'ada'
};

function renderFindUserQuery(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return { ...renderHook(() => useFindUserQuery(id), { wrapper }), queryClient };
}

describe('useFindUserQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: USER });
  });

  it('should request the user named by its id', async () => {
    const { result } = renderFindUserQuery('user-1');
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/users/user-1');
  });

  it('should resolve to the parsed user, so dates arrive as Date objects rather than strings', async () => {
    const { result } = renderFindUserQuery('user-1');
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current.data.createdAt).toEqual(new Date(USER.createdAt));
  });

  it('should reject a malformed user rather than render an incomplete profile', async () => {
    mockAxios.get.mockResolvedValue({ data: { ...USER, username: '' } });
    await expect(new QueryClient().fetchQuery(useFindUserQueryOptions('user-1'))).rejects.toThrow();
  });
});

describe('useFindUserQueryOptions', () => {
  it('should key the cache under the user list, so invalidating users also refreshes this one', () => {
    expect(useFindUserQueryOptions('user-1').queryKey).toEqual(['users', 'user-1']);
  });
});
