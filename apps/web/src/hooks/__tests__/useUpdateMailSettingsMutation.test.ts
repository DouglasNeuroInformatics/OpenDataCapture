import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateMailSettingsMutation } from '../useUpdateMailSettingsMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), patch: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const savedSettings = {
  config: {
    enabled: true,
    encryption: 'starttls',
    hasPassword: true,
    host: 'smtp.example.org',
    port: 587,
    senderAddress: 'noreply@example.org',
    senderName: 'ODC',
    username: 'user'
  },
  newUserEmailTemplate: DEFAULT_NEW_USER_EMAIL_TEMPLATE
};

function renderUpdateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return { ...renderHook(() => useUpdateMailSettingsMutation(), { wrapper }), queryClient };
}

describe('useUpdateMailSettingsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.patch.mockResolvedValue({ data: savedSettings });
  });

  it('patches the settings without raising the default error toast, since the page renders its own', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ newUserEmailTemplate: DEFAULT_NEW_USER_EMAIL_TEMPLATE });
    expect(mockAxios.patch).toHaveBeenCalledWith(
      '/v1/mail/settings',
      { newUserEmailTemplate: DEFAULT_NEW_USER_EMAIL_TEMPLATE },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });

  // An action taken right after a save (e.g. toggling mail off) reads the settings query, so the
  // cache must hold the saved config immediately rather than after an eventual refetch.
  it('seeds the settings cache from the response', async () => {
    const { queryClient, result } = renderUpdateMutation();
    await result.current.mutateAsync({ newUserEmailTemplate: DEFAULT_NEW_USER_EMAIL_TEMPLATE });
    expect(queryClient.getQueryData(['mail-settings'])).toMatchObject({ config: { host: 'smtp.example.org' } });
  });

  it('invalidates the setup state, which gates email UI across the app', async () => {
    const { queryClient, result } = renderUpdateMutation();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await result.current.mutateAsync({ newUserEmailTemplate: DEFAULT_NEW_USER_EMAIL_TEMPLATE });
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['setup-state'] }));
  });
});
