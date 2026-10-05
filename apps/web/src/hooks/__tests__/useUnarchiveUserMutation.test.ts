import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUnarchiveUserMutation } from '../useUnarchiveUserMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderUnarchiveMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUnarchiveUserMutation(), { wrapper }), invalidateQueries };
}

describe('useUnarchiveUserMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should restore the archived user through the unarchive route', async () => {
    const { result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/users/user-1/unarchive');
  });

  it('should announce success once the user is restored', async () => {
    const { result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh every user list, so the restored user reappears among the active ones', async () => {
    const { invalidateQueries, result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});
