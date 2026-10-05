import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteBulkAssignmentsMutation } from '../useDeleteBulkAssignmentsMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
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
  return { ...renderHook(() => useDeleteBulkAssignmentsMutation(), { wrapper }), invalidateQueries };
}

describe('useDeleteBulkAssignmentsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: { deletedCount: 1, failedIds: ['assignment-2'] } });
  });

  it('should post every selected id in one request, so the batch is deleted together', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ ids: ['assignment-1', 'assignment-2'] });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/assignments/bulk/delete', {
      ids: ['assignment-1', 'assignment-2']
    });
  });

  it('should resolve to the ids that could not be deleted, so the caller can report them', async () => {
    const { result } = renderDeleteMutation();
    const outcome = await result.current.mutateAsync({ ids: ['assignment-1', 'assignment-2'] });
    expect(outcome).toEqual({ deletedCount: 1, failedIds: ['assignment-2'] });
  });

  it('should reject a malformed response rather than report a count the server never sent', async () => {
    mockAxios.post.mockResolvedValue({ data: { deletedCount: -1, failedIds: [] } });
    const { result } = renderDeleteMutation();
    await expect(result.current.mutateAsync({ ids: ['assignment-1'] })).rejects.toThrow();
  });

  it('should announce success and refresh every assignment list, so deleted links disappear', async () => {
    const { invalidateQueries, result } = renderDeleteMutation();
    await result.current.mutateAsync({ ids: ['assignment-1'] });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['assignments'] });
  });
});
