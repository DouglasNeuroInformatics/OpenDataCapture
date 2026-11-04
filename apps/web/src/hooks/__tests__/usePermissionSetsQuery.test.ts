import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import {
  PERMISSION_SETS_QUERY_KEY,
  permissionSetsQueryOptions,
  usePermissionSetsQuery
} from '../usePermissionSetsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const PERMISSION_SET = {
  createdAt: '2026-01-01T00:00:00.000Z',
  holderCount: 2,
  id: 'set-1',
  name: 'Research Assistant',
  rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }],
  updatedAt: '2026-01-02T00:00:00.000Z'
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('permissionSetsQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [PERMISSION_SET] });
  });

  it('should parse the sets so dates arrive as Date objects rather than strings', async () => {
    const permissionSets = await createQueryClient().fetchQuery(permissionSetsQueryOptions());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/permission-sets');
    expect(permissionSets[0]!.createdAt).toEqual(new Date(PERMISSION_SET.createdAt));
  });

  it('should reject a set without its holder count, which the list and the delete warning both show', async () => {
    mockAxios.get.mockResolvedValue({ data: [{ ...PERMISSION_SET, holderCount: undefined }] });
    await expect(createQueryClient().fetchQuery(permissionSetsQueryOptions())).rejects.toThrow(z.ZodError);
  });

  it('should cache under the shared key, so mutations can invalidate it', () => {
    expect(permissionSetsQueryOptions().queryKey).toEqual([PERMISSION_SETS_QUERY_KEY]);
  });
});

describe('usePermissionSetsQuery', () => {
  it('should resolve to the sets once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: [PERMISSION_SET] });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    };
    const { result } = renderHook(() => usePermissionSetsQuery(), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.map((permissionSet) => permissionSet.id)).toEqual(['set-1']);
  });
});
