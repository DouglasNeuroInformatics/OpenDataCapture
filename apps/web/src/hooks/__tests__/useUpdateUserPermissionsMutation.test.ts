import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { Permissions } from '@opendatacapture/schemas/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateUserPermissionsMutation } from '../useUpdateUserPermissionsMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), put: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const permissions: Permissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];

const updatedUser = {
  additionalPermissions: permissions,
  basePermissionLevel: 'STANDARD',
  createdAt: '2026-01-01T00:00:00.000Z',
  firstName: 'Jane',
  groupIds: ['group-1'],
  id: 'user-1',
  lastName: 'Doe',
  updatedAt: '2026-01-01T00:00:00.000Z',
  username: 'jdoe'
};

function renderUpdatePermissionsMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUpdateUserPermissionsMutation(), { wrapper }), queryClient };
}

describe('useUpdateUserPermissionsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.put.mockResolvedValue({ data: updatedUser });
  });

  it('should put the complete set of permissions, since the route replaces what is stored', async () => {
    const { result } = renderUpdatePermissionsMutation();
    await result.current.mutateAsync({ id: 'user-1', permissions });
    expect(mockAxios.put).toHaveBeenCalledWith('/v1/users/user-1/permissions', { permissions });
  });

  it('should parse the updated user', async () => {
    const { result } = renderUpdatePermissionsMutation();
    const response = await result.current.mutateAsync({ id: 'user-1', permissions });
    expect(response.additionalPermissions).toEqual(permissions);
  });

  it('should invalidate the users queries, so the page shows the new grant without a reload', async () => {
    const { queryClient, result } = renderUpdatePermissionsMutation();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await result.current.mutateAsync({ id: 'user-1', permissions });
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users'] }));
  });
});
