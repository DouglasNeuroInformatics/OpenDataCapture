import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSelfUpdateUserMutation } from '../useSelfUpdateUserMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderSelfUpdateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useSelfUpdateUserMutation(), { wrapper }), invalidateQueries };
}

describe('useSelfUpdateUserMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should save through the self-update route, which a user may call without permission to manage users', async () => {
    const { result } = renderSelfUpdateMutation();
    await result.current.mutateAsync({ data: { firstName: 'Jane' }, id: 'user-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/users/self-update/user-1', { firstName: 'Jane' });
  });

  it('should announce success and refresh every user list, so the new details show everywhere', async () => {
    const { invalidateQueries, result } = renderSelfUpdateMutation();
    await result.current.mutateAsync({ data: { firstName: 'Jane' }, id: 'user-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
  });

  it('should announce nothing when the save fails', async () => {
    mockAxios.patch.mockRejectedValueOnce(new Error('Forbidden'));
    const { result } = renderSelfUpdateMutation();
    await expect(result.current.mutateAsync({ data: { firstName: 'Jane' }, id: 'user-1' })).rejects.toThrow(
      'Forbidden'
    );
    expect(addNotification).not.toHaveBeenCalled();
  });
});
