import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreatePermissionSetData } from '@opendatacapture/schemas/permission-set';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreatePermissionSetMutation } from '../useCreatePermissionSetMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const DATA: $CreatePermissionSetData = {
  name: 'Research Assistant',
  rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }]
};

function renderCreateMutation() {
  // The app's own default, so a rejection that is not kept away from the error boundary throws.
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useCreatePermissionSetMutation(), { wrapper }), invalidateQueries };
}

describe('useCreatePermissionSetMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should send the set as the request body, without the default error toast the form replaces', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/permission-sets', DATA, {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce success and refresh the sets, so the new set can be assigned straight away', async () => {
    const { invalidateQueries, result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['permission-sets'] });
  });

  it('should keep a refused set out of the router error boundary, so the form keeps what was entered', async () => {
    mockAxios.post.mockRejectedValue(new Error('Conflict'));
    const { result } = renderCreateMutation();
    act(() => result.current.mutate({ data: DATA }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).not.toHaveBeenCalled();
  });
});
