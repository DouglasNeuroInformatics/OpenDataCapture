import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectCustomIdsQueryOptions, useSubjectCustomIdsQuery } from '../useSubjectCustomIdsQuery';

vi.mock('axios');

const runQuery = (groupId?: string) =>
  new QueryClient().fetchQuery(subjectCustomIdsQueryOptions({ params: { groupId } }));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

describe('subjectCustomIdsQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("should request only the group's custom ids rather than every subject in it", async () => {
    get.mockResolvedValueOnce({ data: ['group$a', 'group$b'] });
    await expect(runQuery('group-1')).resolves.toStrictEqual(['group$a', 'group$b']);
    expect(get).toHaveBeenCalledWith('/v1/subjects/groups/group-1/custom-ids');
  });

  it('should request the default group custom ids without a group, so an admin with no group is offered the subjects its sessions create', async () => {
    get.mockResolvedValueOnce({ data: ['root$a'] });
    await expect(runQuery()).resolves.toStrictEqual(['root$a']);
    expect(get).toHaveBeenCalledWith('/v1/subjects/default-group/custom-ids');
  });

  it('should reject a response that is not a list of ids, so nothing unparsed reaches the form', async () => {
    get.mockResolvedValueOnce({ data: [{ firstName: 'Jane', id: 'group$a' }] });
    await expect(runQuery('group-1')).rejects.toThrow();
  });

  it('should key the cache on the group, so switching group does not serve the previous group ids', () => {
    expect(subjectCustomIdsQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      subjectCustomIdsQueryOptions({ params: { groupId: 'group-2' } }).queryKey
    );
  });
});

describe('useSubjectCustomIdsQuery', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("should suspend until the group's custom ids load, then return them to the form", async () => {
    get.mockResolvedValueOnce({ data: ['group$a'] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Suspense, { fallback: null }, children)
      );
    const { result } = renderHook(() => useSubjectCustomIdsQuery({ params: { groupId: 'group-1' } }), { wrapper });
    await waitFor(() => expect(result.current?.data).toStrictEqual(['group$a']));
  });
});
