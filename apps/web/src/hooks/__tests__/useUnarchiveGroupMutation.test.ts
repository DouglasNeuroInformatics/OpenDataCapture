import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUnarchiveGroupMutation } from '../useUnarchiveGroupMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderUnarchiveMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useUnarchiveGroupMutation(), { wrapper }), invalidateQueries };
}

describe('useUnarchiveGroupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should unarchive the group named by its id', async () => {
    const { result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/groups/group-1/unarchive');
  });

  it('should announce success once the group is unarchived', async () => {
    const { result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the group list, so the group can be selected again', async () => {
    const { invalidateQueries, result } = renderUnarchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['groups'] });
  });
});
