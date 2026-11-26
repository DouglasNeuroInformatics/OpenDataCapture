import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLoginMutation } from '../useLoginMutation';

type RequestConfig = {
  headers: { [name: string]: string };
  meta: { disableDefaultAuth: boolean; disableDefaultErrorNotification: boolean };
  validateStatus: (status: number) => boolean;
};

const mockAxios = vi.hoisted(() => ({
  post: vi.fn<(url: string, data: unknown, config: RequestConfig) => Promise<{ data: object; status: number }>>()
}));

vi.mock('axios', () => ({ default: mockAxios }));

const CREDENTIALS = { password: 'secret', username: 'jane' };

function renderLogin(options?: Parameters<typeof useLoginMutation>[0]) {
  // Mirror the app's client, which sends every mutation error to the router error boundary by default
  const queryClient = new QueryClient({ defaultOptions: { mutations: { throwOnError: true } } });
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return renderHook(() => useLoginMutation(options), { wrapper });
}

const loginAnsweredWith = async (status: number, data: object) => {
  mockAxios.post.mockResolvedValue({ data, status });
  const { result } = renderLogin();
  return act(() => result.current.mutateAsync(CREDENTIALS));
};

describe('useLoginMutation', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should post the credentials to the login endpoint', async () => {
    await loginAnsweredWith(200, { accessToken: 'token-123' });
    expect(mockAxios.post.mock.lastCall?.slice(0, 2)).toEqual(['/v1/auth/login', CREDENTIALS]);
  });

  it('should mark the sign-in as interactive, so the token expires after the idle limit', async () => {
    await loginAnsweredWith(200, { accessToken: 'token-123' });
    expect(mockAxios.post.mock.lastCall?.[2].headers).toEqual({ 'odc-interactive-sign-in': 'true' });
  });

  it('should send no access token, since the password dialog signs in while an expired one is still stored', async () => {
    await loginAnsweredWith(200, { accessToken: 'token-123' });
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultAuth: true });
  });

  it('should leave a failed request to the default error notification unless the caller shows its own', async () => {
    await loginAnsweredWith(200, { accessToken: 'token-123' });
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultErrorNotification: false });
  });

  it('should suppress the default error notification for a caller that shows its own', async () => {
    mockAxios.post.mockResolvedValue({ data: { accessToken: 'token-123' }, status: 200 });
    const { result } = renderLogin({ disableDefaultErrorNotification: true });
    await act(() => result.current.mutateAsync(CREDENTIALS));
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultErrorNotification: true });
  });

  it('should accept only 200, 401 and 403 as answers, so any other status still throws', async () => {
    await loginAnsweredWith(200, { accessToken: 'token-123' });
    const validateStatus = mockAxios.post.mock.lastCall?.[2].validateStatus;
    expect([200, 401, 403, 404, 500].map((status) => validateStatus?.(status))).toEqual([
      true,
      true,
      true,
      false,
      false
    ]);
  });

  it('should return the access token of a successful sign-in', async () => {
    expect(await loginAnsweredWith(200, { accessToken: 'token-123' })).toEqual({
      accessToken: 'token-123',
      kind: 'success'
    });
  });

  it('should report rejected credentials', async () => {
    expect(await loginAnsweredWith(401, {})).toEqual({ kind: 'unauthorized' });
  });

  it('should report an archived account', async () => {
    expect(await loginAnsweredWith(403, { message: 'Account Archived' })).toEqual({ kind: 'archived' });
  });

  it('should report an account refused for any other reason as disabled', async () => {
    expect(await loginAnsweredWith(403, { message: 'Account Disabled' })).toEqual({ kind: 'disabled' });
  });

  it('should expose a failed request as mutation state rather than throwing to the error boundary', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network Error'));
    const { result } = renderLogin();
    act(() => result.current.mutate(CREDENTIALS));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network Error');
  });
});
