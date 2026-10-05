import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateAssignment } from '../useUpdateAssignment';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderUpdateAssignment() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUpdateAssignment(), { wrapper }), invalidateQueries };
}

describe('useUpdateAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should patch the status of the given assignment', async () => {
    const { result } = renderUpdateAssignment();
    await result.current.mutateAsync({ data: { status: 'CANCELED' }, params: { id: 'assignment-1' } });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/assignments/assignment-1', { status: 'CANCELED' });
  });

  it('should announce success and refresh every assignment list, so the new status shows everywhere', async () => {
    const { invalidateQueries, result } = renderUpdateAssignment();
    await result.current.mutateAsync({ data: { status: 'CANCELED' }, params: { id: 'assignment-1' } });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['assignments'] });
  });
});
