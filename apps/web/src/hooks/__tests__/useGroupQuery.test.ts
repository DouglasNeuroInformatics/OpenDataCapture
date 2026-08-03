import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGroupQuery } from '../useGroupQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));

vi.mock('axios', () => ({ default: mockAxios }));

const group = {
  accessibleInstrumentIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  emailTemplates: [],
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Group One',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: '2026-01-02T00:00:00.000Z',
  userIds: []
};

function renderGroupQuery(groupId: null | string | undefined) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useGroupQuery(groupId), { wrapper }), queryClient };
}

describe('useGroupQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: group });
  });

  it('requests the group it was given', async () => {
    const { result } = renderGroupQuery('group-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/groups/group-1');
  });

  it('caches under a group-scoped key', async () => {
    const { queryClient, result } = renderGroupQuery('group-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['group', 'group-1'])).toMatchObject({ id: 'group-1' });
  });

  it.each([null, undefined])('does not request anything for the group id %s', (groupId) => {
    renderGroupQuery(groupId);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
