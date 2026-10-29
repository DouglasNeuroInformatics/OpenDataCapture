import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreateGroupData } from '@opendatacapture/schemas/group';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateGroupMutation } from '../useCreateGroupMutation';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const GROUP_DATA: $CreateGroupData = { name: 'Group One', type: 'CLINICAL' };

function renderCreateMutation() {
  // The app's own default, so a rejection that is not kept away from the error boundary throws.
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, throwOnError: true } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useCreateGroupMutation(), { wrapper }), invalidateQueries };
}

describe('useCreateGroupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should send the group as the request body, without the default error toast the form replaces', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: GROUP_DATA });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/groups', GROUP_DATA, {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce success once the group is created', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: GROUP_DATA });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the group list, so the new group can be selected straight away', async () => {
    const { invalidateQueries, result } = renderCreateMutation();
    await result.current.mutateAsync({ data: GROUP_DATA });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['groups'] });
  });

  it('should keep a refused group out of the router error boundary, so the form keeps what was typed', async () => {
    mockAxios.post.mockRejectedValue(new Error('Conflict'));
    const { result } = renderCreateMutation();
    act(() => result.current.mutate({ data: GROUP_DATA }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(addNotification).not.toHaveBeenCalled();
  });
});
