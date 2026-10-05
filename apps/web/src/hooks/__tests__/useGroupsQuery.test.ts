import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GROUPS_QUERY_KEY, groupsQueryOptions, useGroupsQuery } from '../useGroupsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const GROUP = {
  accessibleInstrumentIds: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  id: 'group-1',
  instrumentRepoIds: [],
  name: 'Clinic',
  settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
  subjectIds: [],
  type: 'CLINICAL',
  updatedAt: '2025-01-02T00:00:00.000Z',
  userIds: []
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('groupsQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [GROUP] });
  });

  it('should parse the groups so dates arrive as Date objects rather than strings', async () => {
    const groups = await createQueryClient().fetchQuery(groupsQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/groups');
    expect(groups[0]!.createdAt).toEqual(new Date(GROUP.createdAt));
  });

  it('should reject a response that is not an array of groups', async () => {
    mockAxios.get.mockResolvedValue({ data: [{ id: 'group-1' }] });
    await expect(createQueryClient().fetchQuery(groupsQueryOptions())).rejects.toThrow();
  });

  it('should cache under the shared key, so mutations can invalidate it', () => {
    expect(groupsQueryOptions().queryKey).toEqual([GROUPS_QUERY_KEY]);
  });
});

describe('useGroupsQuery', () => {
  it('should resolve to the groups once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: [GROUP] });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useGroupsQuery(), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.map((group) => group.id)).toEqual(['group-1']);
  });
});
