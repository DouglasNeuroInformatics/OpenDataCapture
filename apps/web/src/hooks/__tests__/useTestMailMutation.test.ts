import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { MAIL_CLIENT_TIMEOUT, MAIL_TRANSPORT_TIMEOUTS } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTestMailMutation } from '../useTestMailMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), post: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

function renderTestMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useTestMailMutation(), { wrapper });
}

describe('useTestMailMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: { success: true } });
  });

  it('posts the candidate configuration and parses the result', async () => {
    const { result } = renderTestMutation();
    await expect(result.current.mutateAsync({ recipient: 'a@x.org' })).resolves.toEqual({ success: true });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/mail/test',
      { recipient: 'a@x.org' },
      { meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }, timeout: MAIL_CLIENT_TIMEOUT }
    );
  });

  // Aborting before the server's own SMTP budget expires is how the client ends up reporting a
  // timeout for a test the server went on to complete.
  it('waits out the whole server-side failure budget', () => {
    const serverBudget =
      MAIL_TRANSPORT_TIMEOUTS.connection + MAIL_TRANSPORT_TIMEOUTS.greeting + MAIL_TRANSPORT_TIMEOUTS.socket;
    expect(MAIL_CLIENT_TIMEOUT).toBeGreaterThan(serverBudget);
  });
});
