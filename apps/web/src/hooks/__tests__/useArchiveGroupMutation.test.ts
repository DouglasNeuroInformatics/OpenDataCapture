import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useArchiveGroupMutation } from '../useArchiveGroupMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());
const store = vi.hoisted(() => ({
  changeGroup: vi.fn(),
  currentGroup: null as null | { id: string }
}));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: typeof store) => unknown) => selector(store))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

function renderArchiveMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useArchiveGroupMutation(), { wrapper }), invalidateQueries };
}

describe('useArchiveGroupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
    store.currentGroup = { id: 'group-2' };
  });

  it('should archive the group rather than delete it, so its records and series keep their owner', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/v1/groups/group-1/archive');
  });

  it('should announce success once the group is archived', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh the group list, so the archived group can no longer be selected', async () => {
    const { invalidateQueries, result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['groups'] });
  });

  it('should deselect the group archived while selected, since the switcher no longer lists it', async () => {
    store.currentGroup = { id: 'group-1' };
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(store.changeGroup).toHaveBeenCalledWith(null);
  });

  it('should keep the selected group when another group is archived', async () => {
    const { result } = renderArchiveMutation();
    await result.current.mutateAsync({ id: 'group-1' });
    expect(store.changeGroup).not.toHaveBeenCalled();
  });
});
