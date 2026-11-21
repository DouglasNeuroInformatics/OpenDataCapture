import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubjectIdentificationCountsQuery } from '../useSubjectIdentificationCountsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));

vi.mock('axios', () => ({ default: mockAxios }));

const counts = { CUSTOM_FIELDS: 1, CUSTOM_ID: 2, PERSONAL_INFO: 3 };

const renderCountsQuery = (isEnabled: boolean) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return renderHook(() => useSubjectIdentificationCountsQuery({ isEnabled }), { wrapper });
};

describe('useSubjectIdentificationCountsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: counts });
  });

  it('should request the counts and parse them at the boundary', async () => {
    const { result } = renderCountsQuery(true);
    await waitFor(() => expect(result.current.data).toStrictEqual(counts));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects/identification/counts');
  });

  it('should not count anything while no method is being turned off', () => {
    renderCountsQuery(false);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
