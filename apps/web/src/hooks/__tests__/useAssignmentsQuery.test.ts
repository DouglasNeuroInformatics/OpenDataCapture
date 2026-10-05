import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assignmentsQueryOptions, useAssignmentsQuery } from '../useAssignmentsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const ASSIGNMENT = {
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2027-01-01T00:00:00.000Z',
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: '2026-01-01T00:00:00.000Z',
  url: 'https://gateway.example.org/assignments/assignment-1'
};

function renderAssignmentsQuery(params?: { groupId?: string; subjectId?: string }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useAssignmentsQuery({ params }), { wrapper });
}

describe('useAssignmentsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [ASSIGNMENT] });
  });

  it('should forward the group and subject filters to the server', async () => {
    const { result } = renderAssignmentsQuery({ groupId: 'group-1', subjectId: 'subject-1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/assignments', {
      params: { groupId: 'group-1', subjectId: 'subject-1' }
    });
  });

  it('should parse the response, so dates arrive as Date objects rather than strings', async () => {
    const { result } = renderAssignmentsQuery();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.expiresAt).toEqual(new Date(ASSIGNMENT.expiresAt));
  });

  it('should fail rather than render an assignment the server returned malformed', async () => {
    mockAxios.get.mockResolvedValue({ data: [{ ...ASSIGNMENT, url: 'not a url' }] });
    const { result } = renderAssignmentsQuery();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('assignmentsQueryOptions', () => {
  it('should key the cache on the group and subject, so switching either does not serve a stale list', () => {
    expect(assignmentsQueryOptions({ params: { groupId: 'group-1', subjectId: 'subject-1' } }).queryKey).toEqual([
      'assignments',
      'group-1',
      'subject-1'
    ]);
  });

  it('should share one unfiltered key when no filters are given', () => {
    expect(assignmentsQueryOptions().queryKey).toEqual(['assignments', undefined, undefined]);
  });
});
