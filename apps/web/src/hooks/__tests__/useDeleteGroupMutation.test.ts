import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteGroupMutation } from '../useDeleteGroupMutation';

const mockAxios = vi.hoisted(() => ({ delete: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderDeleteMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useDeleteGroupMutation(), { wrapper }), invalidateQueries };
}

describe('useDeleteGroupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  it('should delete the group named by its id', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(mockAxios.delete).toHaveBeenCalledWith('/v1/groups/group-1');
  });

  it('should announce success once the group is deleted', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the group list, so the deleted group cannot still be selected', async () => {
    const { invalidateQueries, result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['groups'] });
  });
});
