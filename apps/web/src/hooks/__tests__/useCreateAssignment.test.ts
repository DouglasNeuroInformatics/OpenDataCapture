import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateAssignment } from '../useCreateAssignment';

const mockAxios = vi.hoisted(() => ({ post: vi.fn() }));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification }))
}));

const DATA: $CreateAssignmentData = {
  expiresAt: new Date('2030-01-01T00:00:00.000Z'),
  groupId: 'group-1',
  instrumentId: 'instrument-1',
  subjectId: 'subject-1'
};

const ASSIGNMENT = {
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2030-01-01T00:00:00.000Z',
  groupId: 'group-1',
  id: 'assignment-1',
  instrumentId: 'instrument-1',
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: '2026-01-01T00:00:00.000Z',
  url: 'https://gateway.example.org/assignments/assignment-1'
};

function renderCreateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useCreateAssignment(), { wrapper }), invalidateQueries };
}

describe('useCreateAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: ASSIGNMENT });
  });

  it('should send the assignment as the request body', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/assignments', DATA);
  });

  it('should resolve to the parsed assignment, so its link and expiry are typed', async () => {
    const { result } = renderCreateMutation();
    const assignment = await result.current.mutateAsync({ data: DATA });
    expect(assignment.expiresAt).toEqual(new Date(ASSIGNMENT.expiresAt));
  });

  it('should announce success once the assignment is created', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh every assignment list, so the new link appears', async () => {
    const { invalidateQueries, result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['assignments'] });
  });
});
