import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import type { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateInstrumentRepoMutation } from '../useCreateInstrumentRepoMutation';

const mockAxios = vi.hoisted(() => ({
  isAxiosError: vi.fn((error: unknown) => typeof error === 'object' && error !== null && 'response' in error),
  post: vi.fn()
}));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

const DATA: $CreateInstrumentRepoData = { url: 'https://github.com/example/instruments' };

function renderCreateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useCreateInstrumentRepoMutation(), { wrapper }), invalidateQueries };
}

describe('useCreateInstrumentRepoMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it('should suppress the default error toast, since the hook reports failures itself', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/instrument-repos', DATA, {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce that the repository was imported', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(addNotification).toHaveBeenCalledWith({ message: 'Repository imported successfully', type: 'success' });
  });

  it('should refresh both the repository and instrument lists, so imported instruments appear without a reload', async () => {
    const { invalidateQueries, result } = renderCreateMutation();
    await result.current.mutateAsync({ data: DATA });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repos'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it("should show the server's reason when the import is refused, so the user knows what to fix", async () => {
    mockAxios.post.mockRejectedValue({ response: { data: { message: 'Repository already imported' } } });
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync({ data: DATA })).rejects.toBeTruthy();
    expect(addNotification).toHaveBeenCalledWith({ message: 'Repository already imported', type: 'error' });
  });

  it('should fall back to a generic message when the failure carries no reason', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network Error'));
    const { result } = renderCreateMutation();
    await expect(result.current.mutateAsync({ data: DATA })).rejects.toThrow('Network Error');
    expect(addNotification).toHaveBeenCalledWith({ message: 'Failed to import repository', type: 'error' });
  });
});
