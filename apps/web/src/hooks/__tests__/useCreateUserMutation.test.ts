import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateUserMutation } from '../useCreateUserMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), post: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const createUserData = {
  basePermissionLevel: 'STANDARD' as const,
  firstName: 'Jane',
  groupIds: [],
  lastName: 'Doe',
  password: 'Password123!',
  username: 'jdoe'
};

const createdUser = {
  additionalPermissions: [],
  basePermissionLevel: 'STANDARD',
  createdAt: '2026-01-01T00:00:00.000Z',
  firstName: 'Jane',
  groupIds: [],
  id: 'user-1',
  lastName: 'Doe',
  updatedAt: '2026-01-01T00:00:00.000Z',
  username: 'jdoe',
  welcomeEmail: { message: 'Welcome jdoe', recipient: null, status: 'DISABLED' }
};

function renderCreateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useCreateUserMutation(), { wrapper }), queryClient };
}

describe('useCreateUserMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: createdUser });
  });

  // The timeout must outlast the server's SMTP budget: an abort mid-request leaves the user
  // created, so the retry hits "username exists" with the welcome-email outcome lost.
  it('posts the user with the language as a query param and the mail-aware timeout', async () => {
    const { result } = renderCreateMutation();
    await result.current.mutateAsync({ data: createUserData, language: 'fr' });
    expect(mockAxios.post).toHaveBeenCalledWith('/v1/users', createUserData, {
      meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
      params: { language: 'fr' },
      timeout: MAIL_CLIENT_TIMEOUT
    });
  });

  it('parses the created user together with the welcome-email outcome', async () => {
    const { result } = renderCreateMutation();
    const response = await result.current.mutateAsync({ data: createUserData });
    expect(response.username).toBe('jdoe');
    expect(response.welcomeEmail).toMatchObject({ status: 'DISABLED' });
  });

  it('invalidates the users list so the new user appears without a reload', async () => {
    const { queryClient, result } = renderCreateMutation();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await result.current.mutateAsync({ data: createUserData });
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users'] }));
  });
});
