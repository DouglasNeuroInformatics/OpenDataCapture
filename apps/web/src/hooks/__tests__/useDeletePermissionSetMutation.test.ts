import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeletePermissionSetMutation } from '../useDeletePermissionSetMutation';

const mockAxios = vi.hoisted(() => ({ delete: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderDeleteMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useDeletePermissionSetMutation(), { wrapper }), invalidateQueries };
}

describe('useDeletePermissionSetMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  it('should delete the set named by its id and announce it', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'set-1' });
    expect(mockAxios.delete).toHaveBeenCalledWith('/v1/permission-sets/set-1');
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the sets and the users, since every holder of the set has lost it', async () => {
    const { invalidateQueries, result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'set-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});
