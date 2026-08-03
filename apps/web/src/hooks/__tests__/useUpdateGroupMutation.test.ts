import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateGroupMutation } from '../useUpdateGroupMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), patch: vi.fn() }));
const store = vi.hoisted(() => ({ currentGroup: { id: 'group-1' } }));

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (store: unknown) => unknown) => selector(store))
}));

const group = {
  accessibleInstrumentIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: '2026-01-02T00:00:00.000Z',
  userIds: []
};

function renderUpdateMutation(options?: Parameters<typeof useUpdateGroupMutation>[0]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useUpdateGroupMutation(options), { wrapper });
}

describe('useUpdateGroupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: group });
  });

  it('patches the currently selected group and keeps the default error toast', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ name: 'Renamed' });
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/groups/group-1',
      { name: 'Renamed' },
      { meta: { disableDefaultErrorNotification: false } }
    );
  });

  // A caller that opts out of throwing renders its own failure feedback, so the interceptor's
  // generic toast would appear alongside it as a double notification.
  it('suppresses the default error toast for a caller that handles its own errors', async () => {
    const { result } = renderUpdateMutation({ throwOnError: false });
    await result.current.mutateAsync({ name: 'Renamed' });
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/groups/group-1',
      { name: 'Renamed' },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });
});
