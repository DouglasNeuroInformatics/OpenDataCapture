import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useResetPasswordMutation } from '../useResetPasswordMutation';

const mockAxios = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

function renderResetPassword() {
  // Mirror the app's client, which sends every mutation error to the router error boundary by default
  const queryClient = new QueryClient({ defaultOptions: { mutations: { throwOnError: true } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useResetPasswordMutation(), { wrapper });
}

describe('useResetPasswordMutation', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  it('should set the password through the self-update endpoint without the default error notification', async () => {
    const { result } = renderResetPassword();
    await act(() => result.current.mutateAsync({ id: 'user-1', password: 'Secret123!' }));
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/users/self-update/user-1',
      { password: 'Secret123!' },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });

  it('should expose a rejected password as mutation state rather than throwing to the error boundary', async () => {
    mockAxios.patch.mockRejectedValue(new Error('Bad Request'));
    const { result } = renderResetPassword();
    act(() => result.current.mutate({ id: 'user-1', password: 'password' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Bad Request');
  });
});
