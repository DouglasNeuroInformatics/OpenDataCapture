import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdatePermissionSetMutation } from '../useUpdatePermissionSetMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderUpdateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useUpdatePermissionSetMutation(), { wrapper }), invalidateQueries };
}

describe('useUpdatePermissionSetMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should patch the set named by its id, without the default error toast the form replaces', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ data: { name: 'Renamed' }, id: 'set-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/permission-sets/set-1',
      { name: 'Renamed' },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });

  it('should announce success and refresh the sets, so every page showing the set sees the change', async () => {
    const { invalidateQueries, result } = renderUpdateMutation();
    await result.current.mutateAsync({ data: { name: 'Renamed' }, id: 'set-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
  });

  it('should keep a refused update out of the router error boundary, so the form keeps the edits', async () => {
    mockAxios.patch.mockRejectedValue(new Error('Conflict'));
    const { result } = renderUpdateMutation();
    act(() => result.current.mutate({ data: { name: 'Taken' }, id: 'set-1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).not.toHaveBeenCalled();
  });
});
