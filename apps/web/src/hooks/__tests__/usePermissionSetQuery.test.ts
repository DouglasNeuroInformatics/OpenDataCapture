import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { permissionSetQueryOptions, usePermissionSetQuery } from '../usePermissionSetQuery';
import { PERMISSION_SETS_QUERY_KEY } from '../usePermissionSetsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const PERMISSION_SET = {
  createdAt: '2026-01-01T00:00:00.000Z',
  holderCount: 0,
  id: 'set-1',
  name: 'Research Assistant',
  rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }],
  updatedAt: '2026-01-02T00:00:00.000Z'
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('permissionSetQueryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: PERMISSION_SET });
  });

  it('should request the set named by its id', async () => {
    const permissionSet = await createQueryClient().fetchQuery(permissionSetQueryOptions('set-1'));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/permission-sets/set-1');
    expect(permissionSet.updatedAt).toEqual(new Date(PERMISSION_SET.updatedAt));
  });

  it('should reject a response that is not a set', async () => {
    mockAxios.get.mockResolvedValue({ data: { id: 'set-1' } });
    await expect(createQueryClient().fetchQuery(permissionSetQueryOptions('set-1'))).rejects.toThrow(z.ZodError);
  });

  it('should key each set under the list key, so invalidating the list refreshes it too', () => {
    expect(permissionSetQueryOptions('set-1').queryKey).toEqual([PERMISSION_SETS_QUERY_KEY, 'set-1']);
    expect(permissionSetQueryOptions('set-2').queryKey).not.toEqual(permissionSetQueryOptions('set-1').queryKey);
  });
});

describe('usePermissionSetQuery', () => {
  it('should resolve to the set once the suspended request settles', async () => {
    mockAxios.get.mockResolvedValue({ data: PERMISSION_SET });
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => {
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    };
    const { result } = renderHook(() => usePermissionSetQuery('set-1'), { wrapper });
    await waitFor(() => expect(result.current).toBeTruthy());
    expect(result.current.data.name).toBe('Research Assistant');
  });
});
