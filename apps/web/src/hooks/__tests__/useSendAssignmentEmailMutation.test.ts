import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSendAssignmentEmailMutation } from '../useSendAssignmentEmailMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), post: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const delivered = { message: 'rendered', recipient: 'p@x.org', status: 'SENT' };

function renderSendMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useSendAssignmentEmailMutation(), { wrapper });
}

describe('useSendAssignmentEmailMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: delivered });
  });

  it('posts to the assignment email endpoint and parses the delivery result', async () => {
    const { result } = renderSendMutation();
    const outcome = await result.current.mutateAsync({
      assignmentId: 'assignment-1',
      language: 'en',
      recipient: 'p@x.org',
      templateId: null
    });
    expect(outcome).toEqual(delivered);
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/assignments/assignment-1/email',
      { language: 'en', recipient: 'p@x.org', templateId: null },
      { meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }, timeout: MAIL_CLIENT_TIMEOUT }
    );
  });

  // The id lands in the URL path, so it has to be encoded rather than interpolated raw.
  it('encodes the assignment id into the path', async () => {
    const { result } = renderSendMutation();
    await result.current.mutateAsync({ assignmentId: 'a/b', language: 'en', recipient: 'p@x.org' });
    expect(mockAxios.post.mock.lastCall?.[0]).toBe('/v1/assignments/a%2Fb/email');
  });
});
