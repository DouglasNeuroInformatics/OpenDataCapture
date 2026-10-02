import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { Permissions } from '@opendatacapture/schemas/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateUserMutation } from '../useUpdateUserMutation';

const mocks = vi.hoisted(() => ({ addNotification: vi.fn(), patch: vi.fn(), put: vi.fn() }));
vi.mock('axios', () => ({ default: { patch: mocks.patch, put: mocks.put } }));
vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: (selector: (store: { addNotification: typeof mocks.addNotification }) => unknown) =>
    selector(mocks)
}));

const permissions: Permissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];

function renderUpdateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUpdateUserMutation(), { wrapper }), queryClient };
}

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  mocks.patch.mockResolvedValue({});
  mocks.put.mockResolvedValue({});
});

describe('useUpdateUserMutation', () => {
  it('should show one confirmation after both account and permissions save', async () => {
    const { queryClient, result } = renderUpdateMutation();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await result.current.mutateAsync({ data: { email: 'jane@example.org' }, id: 'user-1', permissions });
    expect(mocks.patch).toHaveBeenCalledWith('/v1/users/user-1', { email: 'jane@example.org' });
    expect(mocks.put).toHaveBeenCalledWith('/v1/users/user-1/permissions', { permissions });
    expect(mocks.addNotification).toHaveBeenCalledExactlyOnceWith({ type: 'success' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users'] });
  });

  it('should save group membership before permissions that depend on it', async () => {
    const accountSave = Promise.withResolvers<object>();
    mocks.patch.mockReturnValueOnce(accountSave.promise);
    const { result } = renderUpdateMutation();
    const save = result.current.mutateAsync({ data: { groupIds: ['group-1'] }, id: 'user-1', permissions });
    await vi.waitFor(() => expect(mocks.patch).toHaveBeenCalled());
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.addNotification).not.toHaveBeenCalled();
    accountSave.resolve({});
    await save;
    expect(mocks.put).toHaveBeenCalledOnce();
  });

  it('should save an account without replacing permissions when none were supplied', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ data: { disabled: false }, id: 'user-1' });
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.addNotification).toHaveBeenCalledOnce();
  });

  it('should clear permissions when the last row was removed', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ data: {}, id: 'user-1', permissions: [] });
    expect(mocks.put).toHaveBeenCalledWith('/v1/users/user-1/permissions', { permissions: [] });
  });

  it('should show no success confirmation when permissions fail to save', async () => {
    mocks.put.mockRejectedValueOnce(new Error('permission save failed'));
    const { result } = renderUpdateMutation();
    await expect(result.current.mutateAsync({ data: {}, id: 'user-1', permissions })).rejects.toThrow(
      'permission save failed'
    );
    expect(mocks.addNotification).not.toHaveBeenCalled();
  });
});
