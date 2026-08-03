import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMailSettingsQuery } from '../useMailSettingsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));

vi.mock('axios', () => ({ default: mockAxios }));

const settings = {
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

function renderSettingsQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, createElement(Suspense, { fallback: null }, children));
  return { ...renderHook(() => useMailSettingsQuery(), { wrapper }), queryClient };
}

describe('useMailSettingsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: settings });
  });

  it('requests the settings and parses them at the boundary', async () => {
    const { result } = renderSettingsQuery();
    await waitFor(() => expect(result.current?.data).toBeTruthy());
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/mail/settings');
    expect(result.current?.data.config).toMatchObject({ hasPassword: true, host: 'smtp.example.org' });
  });

  // The update mutation seeds this exact key from its response; a drift would leave the page
  // reading a cache entry no save ever refreshes.
  it('caches under the key the update mutation seeds', async () => {
    const { queryClient, result } = renderSettingsQuery();
    await waitFor(() => expect(result.current?.data).toBeTruthy());
    expect(queryClient.getQueryData(['mail-settings'])).toMatchObject({ config: { host: 'smtp.example.org' } });
  });
});
