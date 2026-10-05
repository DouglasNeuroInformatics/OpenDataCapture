import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectQueryOptions, useSubjectQuery } from '../useSubjectQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const subject = {
  createdAt: '2026-01-01T00:00:00.000Z',
  dateOfBirth: '1990-05-04T00:00:00.000Z',
  groupIds: ['group-1'],
  id: 'subject-1',
  sex: 'FEMALE',
  updatedAt: '2026-01-02T00:00:00.000Z'
};

function renderSubjectQuery(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return renderHook(() => useSubjectQuery({ params: { id } }), { wrapper });
}

describe('useSubjectQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: subject });
  });

  it('should request the subject by its id', async () => {
    const { result } = renderSubjectQuery('subject-1');
    await waitFor(() => expect(result.current?.data).toBeTruthy());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects/subject-1', { params: { id: 'subject-1' } });
  });

  it('should parse the date of birth into a date, so the page can compute the subject age', async () => {
    const { result } = renderSubjectQuery('subject-1');
    await waitFor(() => expect(result.current?.data).toBeTruthy());
    expect(result.current.data.dateOfBirth).toStrictEqual(new Date('1990-05-04T00:00:00.000Z'));
  });

  it('should key the cache on the subject id, so opening another subject does not serve the previous one', () => {
    expect(subjectQueryOptions({ params: { id: 'subject-1' } }).queryKey).not.toStrictEqual(
      subjectQueryOptions({ params: { id: 'subject-2' } }).queryKey
    );
  });
});
