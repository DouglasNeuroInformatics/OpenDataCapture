import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteInstrumentRepoMutation } from '../useDeleteInstrumentRepoMutation';

const mockAxios = vi.hoisted(() => ({
  delete: vi.fn(),
  isAxiosError: vi.fn((error: unknown) => typeof error === 'object' && error !== null && 'response' in error)
}));
const addNotification = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en)
  }))
}));

function renderDeleteMutation() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useDeleteInstrumentRepoMutation(), { wrapper }), invalidateQueries };
}

describe('useDeleteInstrumentRepoMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  it('should delete the repository and suppress the default error toast, since the hook reports failures itself', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(mockAxios.delete).toHaveBeenCalledWith('/v1/instrument-repos/repo-1', {
      meta: { disableDefaultErrorNotification: true }
    });
  });

  it('should announce success once the repository is deleted', async () => {
    const { result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(addNotification).toHaveBeenCalledWith({ type: 'success' });
  });

  it('should refresh both the repository and instrument lists, so reconciled instruments are shown', async () => {
    const { invalidateQueries, result } = renderDeleteMutation();
    await result.current.mutateAsync({ id: 'repo-1' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-repos'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['instrument-info'] });
  });

  it("should show the server's reason when the deletion is refused", async () => {
    mockAxios.delete.mockRejectedValue({ response: { data: { message: 'Repository is in use' } } });
    const { result } = renderDeleteMutation();
    await expect(result.current.mutateAsync({ id: 'repo-1' })).rejects.toBeTruthy();
    expect(addNotification).toHaveBeenCalledWith({ message: 'Repository is in use', type: 'error' });
  });

  it('should fall back to a generic message when the failure carries no reason', async () => {
    mockAxios.delete.mockRejectedValue(new Error('Network Error'));
    const { result } = renderDeleteMutation();
    await expect(result.current.mutateAsync({ id: 'repo-1' })).rejects.toThrow('Network Error');
    expect(addNotification).toHaveBeenCalledWith({ message: 'Failed to delete repository', type: 'error' });
  });
});
