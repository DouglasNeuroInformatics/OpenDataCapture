import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  axios: { post: vi.fn() },
  isAxiosError: vi.fn()
}));

vi.mock('axios', () => ({
  default: mocks.axios,
  isAxiosError: mocks.isAxiosError
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: (selector: any) => selector({ addNotification: mocks.addNotification })
}));

const {
  ASSIGNMENTS_QUERY_KEY,
  toBulkAssignmentFailure,
  useBulkAssignmentPreflightMutation,
  useCreateBulkAssignmentsMutation
} = await import('../useBulkAssignments');

const futureDate = () => new Date(Date.now() + 86_400_000);

const request = {
  allowDuplicates: false,
  groupId: 'group-1',
  subjectIds: ['subject-1'],
  timepoints: [{ expiresAt: futureDate(), instrumentId: 'instrument-1' }]
};

const assignment = {
  completedAt: null,
  createdAt: new Date().toISOString(),
  expiresAt: futureDate().toISOString(),
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: new Date().toISOString(),
  url: 'http://localhost:3500/assignments/assignment-1'
};

const renderWithClient = <T>(hook: () => T) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  const result = renderHook(hook, {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)
  });
  return { ...result, queryClient };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBulkAssignmentPreflightMutation', () => {
  it('should parse the preflight result at the boundary', async () => {
    mocks.axios.post.mockResolvedValueOnce({
      data: { assignmentCount: 2, subjectCount: 1, timepointCount: 2 }
    });
    const { result } = renderWithClient(() => useBulkAssignmentPreflightMutation());
    result.current.mutate(request);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ assignmentCount: 2, subjectCount: 1, timepointCount: 2 });
  });

  it('should reject a response that does not match the contract, rather than passing it on', async () => {
    mocks.axios.post.mockResolvedValueOnce({ data: { assignmentCount: 'two' } });
    const { result } = renderWithClient(() => useBulkAssignmentPreflightMutation());
    result.current.mutate(request);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should not retry, since a refusal is a considered answer and would only be repeated', async () => {
    mocks.axios.post.mockRejectedValue(new Error('nope'));
    const { result } = renderWithClient(() => useBulkAssignmentPreflightMutation());
    result.current.mutate(request);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.axios.post).toHaveBeenCalledTimes(1);
  });
});

describe('useCreateBulkAssignmentsMutation', () => {
  it('should parse created assignments and invalidate the assignments query', async () => {
    mocks.axios.post.mockResolvedValueOnce({ data: [assignment] });
    const { queryClient, result } = renderWithClient(() => useCreateBulkAssignmentsMutation());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    result.current.mutate(request);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ASSIGNMENTS_QUERY_KEY });
  });

  it('should not invalidate or notify when the batch was refused, since nothing was created', async () => {
    mocks.axios.post.mockRejectedValueOnce(new Error('refused'));
    const { queryClient, result } = renderWithClient(() => useCreateBulkAssignmentsMutation());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    result.current.mutate(request);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
    expect(mocks.addNotification).not.toHaveBeenCalled();
  });
});

describe('toBulkAssignmentFailure', () => {
  it('should recover the structured refusal from a rejected request', () => {
    mocks.isAxiosError.mockReturnValueOnce(true);
    const failure = toBulkAssignmentFailure({
      response: {
        data: {
          code: 'BULK_ASSIGNMENT_REFUSED',
          issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-1'] }]
        }
      }
    });
    expect(failure?.issues[0]).toMatchObject({ kind: 'SUBJECT_UNAVAILABLE' });
  });

  it('should return null for a transport error, which carries nothing to show the user', () => {
    mocks.isAxiosError.mockReturnValueOnce(false);
    expect(toBulkAssignmentFailure(new Error('network down'))).toBeNull();
  });

  it('should return null for an error body that is not a refusal', () => {
    mocks.isAxiosError.mockReturnValueOnce(true);
    expect(toBulkAssignmentFailure({ response: { data: { message: 'Internal Server Error' } } })).toBeNull();
  });
});
