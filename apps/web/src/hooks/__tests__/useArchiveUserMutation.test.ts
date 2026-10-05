import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useArchiveUserMutation } from '../useArchiveUserMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderArchiveMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useArchiveUserMutation(), { wrapper }), invalidateQueries };
}

describe('useArchiveUserMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should archive the user rather than delete them, so their records keep an author', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/users/user-1/archive');
  });

  it('should announce success once the user is archived', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh every user list, so the archived user does not linger in a table', async () => {
    const { invalidateQueries, result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'user-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});
