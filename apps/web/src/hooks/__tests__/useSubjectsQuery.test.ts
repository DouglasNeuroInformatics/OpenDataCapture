import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectsQueryOptions, useSubjectsQuery } from '../useSubjectsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const subject = {
  createdAt: '2026-01-01T00:00:00.000Z',
  groupIds: ['group-1'],
  id: 'subject-1',
  updatedAt: '2026-01-02T00:00:00.000Z'
};

function renderSubjectsQuery(...args: Parameters<typeof useSubjectsQuery>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return renderHook(() => useSubjectsQuery(...args), { wrapper });
}

describe('useSubjectsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [subject] });
  });

  it('should forward the filters to the subjects endpoint, so the server narrows the list', async () => {
    const { result } = renderSubjectsQuery({ params: { groupId: 'group-1', hasRecord: true } });
    await waitFor(() => expect(result.current?.data).toHaveLength(1));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects', { params: { groupId: 'group-1', hasRecord: true } });
  });

  it('should request every subject when called without filters', async () => {
    const { result } = renderSubjectsQuery();
    await waitFor(() => expect(result.current?.data).toHaveLength(1));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects', { params: undefined });
  });

  it('should key the cache on every filter, so a narrower list is not served for a broader one', () => {
    expect(subjectsQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      subjectsQueryOptions({ params: { groupId: 'group-1', hasRecord: true } }).queryKey
    );
  });

  it('should key the unfiltered list apart from a group, so the two lists do not collide', () => {
    expect(subjectsQueryOptions().queryKey).not.toStrictEqual(
      subjectsQueryOptions({ params: { groupId: 'group-1' } }).queryKey
    );
  });

  it('should prefix every key with subjects, so invalidating subjects refreshes every filtered list', () => {
    expect([
      subjectsQueryOptions().queryKey[0],
      subjectsQueryOptions({ params: { groupId: 'group-1' } }).queryKey[0]
    ]).toStrictEqual(['subjects', 'subjects']);
  });
});
