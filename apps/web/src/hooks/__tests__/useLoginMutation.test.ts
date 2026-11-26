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
  post: vi.fn<(url: string, data: unknown, config: RequestConfig) => Promise<{ data: unknown; status: number }>>()
}));

vi.mock('axios', () => ({ default: mockAxios }));

const CREDENTIALS = { password: 'secret', username: 'jane' };

const encodeSegment = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');

const ACCESS_TOKEN = [encodeSegment({ alg: 'HS256', typ: 'JWT' }), encodeSegment({ id: 'user-1' }), 'signature'].join(
  '.'
);

function renderLogin(options?: Parameters<typeof useLoginMutation>[0]) {
  // Mirror the app's client, which sends every mutation error to the router error boundary by default
  const queryClient = new QueryClient({ defaultOptions: { mutations: { throwOnError: true } } });
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return renderHook(() => useLoginMutation(options), { wrapper });
}

const loginAnsweredWith = async (status: number, data: unknown) => {
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
    await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN });
    expect(mockAxios.post.mock.lastCall?.slice(0, 2)).toEqual(['/v1/auth/login', CREDENTIALS]);
  });

  it('should mark the sign-in as interactive, so the token expires after the idle limit', async () => {
    await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN });
    expect(mockAxios.post.mock.lastCall?.[2].headers).toEqual({ 'odc-interactive-sign-in': 'true' });
  });

  it('should send no access token, since the password dialog signs in while an expired one is still stored', async () => {
    await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN });
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultAuth: true });
  });

  it('should leave a failed request to the default error notification unless the caller shows its own', async () => {
    await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN });
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultErrorNotification: false });
  });

  it('should suppress the default error notification for a caller that shows its own', async () => {
    mockAxios.post.mockResolvedValue({ data: { accessToken: ACCESS_TOKEN }, status: 200 });
    const { result } = renderLogin({ disableDefaultErrorNotification: true });
    await act(() => result.current.mutateAsync(CREDENTIALS));
    expect(mockAxios.post.mock.lastCall?.[2].meta).toMatchObject({ disableDefaultErrorNotification: true });
  });

  it('should accept only 200, 401 and 403 as answers, so any other status still throws', async () => {
    await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN });
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
    expect(await loginAnsweredWith(200, { accessToken: ACCESS_TOKEN })).toEqual({
      accessToken: ACCESS_TOKEN,
      kind: 'success'
    });
  });

  it('should report rejected credentials', async () => {
    expect(await loginAnsweredWith(401, {})).toEqual({ kind: 'unauthorized' });
  });

  it('should report an archived account', async () => {
    expect(await loginAnsweredWith(403, { message: 'Account Archived' })).toEqual({ kind: 'archived' });
  });

  it('should report a disabled account', async () => {
    expect(await loginAnsweredWith(403, { message: 'Account Disabled' })).toEqual({ kind: 'disabled' });
  });

  it.each([{ message: 'Forbidden' }, '<html>403 Forbidden</html>', null])(
    "should not take a 403 that is not the API's own (%o) as a verdict on the account, since a proxy can answer one",
    async (data) => {
      expect(await loginAnsweredWith(403, data)).toEqual({ kind: 'forbidden' });
    }
  );

  it.each(['<html>Sign in to the network</html>', {}, { accessToken: 'not-a-token' }])(
    'should fail rather than sign in with an answer that carries no access token (%o)',
    async (data) => {
      mockAxios.post.mockResolvedValue({ data, status: 200 });
      const { result } = renderLogin();
      act(() => result.current.mutate(CREDENTIALS));
      await waitFor(() => expect(result.current.isError).toBe(true));
    }
  );

  it('should expose a failed request as mutation state rather than throwing to the error boundary', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network Error'));
    const { result } = renderLogin();
    act(() => result.current.mutate(CREDENTIALS));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network Error');
  });
});
